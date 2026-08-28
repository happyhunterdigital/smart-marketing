import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentWritten, onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import axios from "axios";
import * as cheerio from "cheerio";
import * as crypto from "crypto";
import { relayToCrm, relayAuditToCrm } from "./services/crmRelay";
import { handleFlowMessage } from "./services/whatsappFlow";
import { resolveKgmid } from "./services/kgmidService";

admin.initializeApp();
const db = getFirestore();

// ============================================================================
// SYSTEM CONSTANTS & UTILITIES
// ============================================================================
const AI_MODEL = "gemini-3.7-flash";
const EMBEDDING_MODEL = "gemini-embedding-preview-0409";

const WHATSAPP_TOKEN = process.env.META_SYSTEM_TOKEN || process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";

function verifyWhatsAppSignature(req: {
  rawBody?: Buffer;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}): boolean {
  if (!WHATSAPP_APP_SECRET) return true;
  const header = req.headers["x-hub-signature-256"];
  if (typeof header !== "string" || !header.startsWith("sha256=")) return false;
  const presented = Buffer.from(header.slice("sha256=".length), "hex");
  const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
  const expected = crypto
    .createHmac("sha256", WHATSAPP_APP_SECRET)
    .update(raw)
    .digest();
  return (
    presented.length === expected.length &&
    crypto.timingSafeEqual(presented, expected)
  );
}
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || "27601016673";

const TOKEN_PREFIX = "hhd_secure_";
const BASE_URL = "https://happyhunterdigital.com";
const VIEWER_PATH = "/view/guide";

const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" }
];

// Validate URLs for SSRF protection — blocks internal/metadata IPs
function isValidFetchUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    if (host.startsWith('169.254.') || host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.')) return false;
    if (host.endsWith('.local') || host.endsWith('.internal') || host === 'metadata.google.internal') return false;
    return /^[a-zA-Z0-9.-]+\.[a-z]{2,}$/.test(host);
  } catch { return false; }
}

// HTML-escape user input before injecting into email templates
function htmlescape(str: string): string {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function generateViewerToken(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(16).toString("hex");
  return `${TOKEN_PREFIX}${timestamp}_${randomPart}`;
}

// ============================================================================
// 1. SMART MARKETING AUDIT (DEEP SCHEMA SCRAPER + HIJACK DETECTION)
// ============================================================================
export const performAudit = onCall({
  region: "us-central1",
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 300,
  secrets: ["GEMINI_API_KEY", "PLACES_API_KEY"]
}, async (request) => {
  const { businessName, location, city, clientEmail, whatsapp } = request.data;
  
  const G_KEY = process.env.GEMINI_API_KEY;
  const P_KEY = process.env.PLACES_API_KEY;
  const safeBizName = String(businessName || "").trim();
  const tableCity = String(city || location || "").trim();

  if (!safeBizName || !tableCity || !clientEmail) throw new HttpsError("invalid-argument", "Missing required fields.");
  if (!G_KEY || !P_KEY) throw new HttpsError("failed-precondition", "AI Core Offline.");

  try {
    const getPlaces = async (query: string) => {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": P_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount,places.websiteUri,places.formattedAddress,places.internationalPhoneNumber",
        },
        body: JSON.stringify({ textQuery: query })
      });
      return res.json() as any;
    };

    const kgmidPromise = resolveKgmid(safeBizName, tableCity, P_KEY);
    const kgmidResult = await kgmidPromise;

    let pData = await getPlaces(`${safeBizName} in ${tableCity}`);
    let biz = pData?.places?.[0] || null;

    if (!biz) {
      pData = await getPlaces(safeBizName);
      biz = pData?.places?.[0] || null;
    }

    const websiteUrl = biz?.websiteUri || null;
    
    let detectedSchemas: string[] = [];
    let hasSchema = false;

    if (websiteUrl) {
      if (!isValidFetchUrl(websiteUrl)) {
        console.warn("SSRF blocked: invalid or internal URL", websiteUrl);
      } else {
        try {
          const webRes = await axios.get(websiteUrl, {
          timeout: 6000,
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
        });
        const $ = cheerio.load(webRes.data);

        $('script[type="application/ld+json"]').each((_, element) => {
          hasSchema = true;
          try {
            const jsonData = JSON.parse($(element).html() || "{}");

            const extractType = (obj: any) => {
              if (!obj) return;
              if (Array.isArray(obj)) {
                obj.forEach(extractType);
              } else if (typeof obj === 'object') {
                if (obj['@type']) detectedSchemas.push(obj['@type']);
                if (obj['@graph']) extractType(obj['@graph']);
              }
            };

            extractType(jsonData);
          } catch(e) { }
        });

        detectedSchemas = [...new Set(detectedSchemas)];
        if (detectedSchemas.length === 0 && hasSchema) detectedSchemas = ["Valid Schema (Unknown Type)"];

      } catch (err) {
        console.log("Web scrape failed or timed out for:", websiteUrl);
      }
      }
    }

    const schemaString = detectedSchemas.length > 0 ? `Detected JSON-LD Schemas: ${detectedSchemas.join(", ")}` : "No Schema Markup detected.";
    const bizNameStr = biz?.displayName?.text || "NONE FOUND";

    let context = "";
    if (!biz) {
      context = `GHOST ENTITY: No Google Maps data found for "${safeBizName}". No Website verified. ${schemaString}`;
    } else {
      context = `
 - User Searched For: "${safeBizName}"
 - Google Maps Returned: "${bizNameStr}"
 - Maps Rating: ${biz.rating || 0} (${biz.userRatingCount || 0} reviews)
 - Website Linked in Maps: ${websiteUrl || 'NONE LINKED'}
 - ${schemaString}
 - ${kgmidResult?.kgmid ? `KGMID (Knowledge Graph Machine ID): ${kgmidResult.kgmid}` : 'KGMID: not resolvable'}
 `;
    }

    const RUBRIC = `
 SCORING RUBRIC (0-100):
 - Baseline 30.
 - Verified Maps Entity (Names Match Exactly): +20 points.
 - Rating >= 4.0: +15 points.
 - Schema Markup Detected (true): +25 points (Crucial for AEO).
 - Ghost Entity OR No Schema: Deduct 30 points.

 CRITICAL TRAFFIC HIJACK INSTRUCTION:
 If the "User Searched For" name and the "Google Maps Returned" name are fundamentally different businesses, you MUST treat this as a TRAFFIC HIJACK.
 If hijacked, set their total score to 0. Do NOT praise the competitor's rating. In your summary, explicitly state that because their digital footprint is weak, Google algorithms are routing their high-intent customers directly to a competitor named "[Google Maps Returned name]". Agitate this pain point.

 INSTRUCTIONS FOR 'truths' ARRAY (Must be exactly 3 items):
 Truth 1: State if they are Verified, a Ghost, or if a Traffic Hijack occurred (name the competitor).
 Truth 2: Mention their Website status.
 Truth 3: Explicitly list the AI Schema Markup types found.
 `;

    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${G_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts:[{ text: `You are Hunter AI. Audit: ${businessName}. Data Context: ${context}. ${RUBRIC} Format JSON: { "score": number, "summary": "string", "truths": ["string", "string", "string"] }` }] }],
        safetySettings: SAFETY_SETTINGS,
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error(`Gemini Audit API Error:`, errText);
      throw new Error(`AI API Error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json() as any;
    if (!aiData.candidates || !aiData.candidates[0].content.parts[0].text) {
        throw new Error("Invalid response structure from Gemini API");
    }
    
    const analysis = JSON.parse(aiData.candidates[0].content.parts[0].text);
    const isHijacked = (biz && analysis.score === 0);

    const telemetry = {
      mapsStatus: !biz ? "GHOST (NOT FOUND)" : isHijacked ? "HIJACKED (COMPETITOR FOUND)" : "VERIFIED",
      mapsName: biz?.displayName?.text || null,
      rating: biz?.rating || null,
      reviewCount: biz?.userRatingCount || null,
      gbpOnly: !websiteUrl,
      gbpUrl: biz ? `https://search.google.com/local/reviews?placeid=${biz.place_id || ''}` : '',
      website: websiteUrl || "None Linked",
      schema: hasSchema,
      schemasDetected: detectedSchemas,
      kgmid: kgmidResult?.kgmid ?? null,
      kgmidName: kgmidResult?.name ?? null,
      kgmidSource: kgmidResult?.source ?? null
    };

    await db.collection("leads").add({ businessName, email: clientEmail, whatsapp: whatsapp || null, score: analysis.score, timestamp: admin.firestore.FieldValue.serverTimestamp() });

    const isGoodScore = analysis.score >= 70;
    const emailHtml = `<div style="font-family: Arial, sans-serif; background-color: #050505; color: #fff; padding: 40px; text-align: center;">
 <h1 style="color: ${isGoodScore ? '#22c55e' : '#eab308'}; margin-bottom: 20px;">Digital Survival Score: ${Number(analysis.score)}/100</h1>
 <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: left;">${htmlescape(analysis.summary)}</p>
 <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
 <h3 style="color: #eab308; margin-top: 0;">What's Next?</h3>
 <p style="color: #d1d5db; margin-bottom: 25px;">Stop losing revenue to invisible algorithms. Let's map out your custom Recovery Protocol.</p>
 <a href="https://calendly.com/motsumitl/30min" style="background-color: #eab308; color: #000; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Book a Free Discovery Call</a>
 </div>
 </div>`;

    await db.collection("mail").add({ to: [clientEmail], message: { subject: `[Intelligence Report] Status: ${htmlescape(String(businessName))}`, html: emailHtml } });

    return { success: true, ...analysis, telemetry };

  } catch (e: any) {
    throw new HttpsError("internal", `Neural Handshake Interrupted. ${e.message}`);
  }
});

// ============================================================================
// 2. STRATEGIC CHAT (Web Chatbot)
// ============================================================================
export const hunterChat = onCall({
  region: "us-central1",
  cors: true,
  secrets: ["GEMINI_API_KEY"]
}, async (request) => {
  const { message } = request.data;
  const G_KEY = process.env.GEMINI_API_KEY;

  if (!message || !G_KEY) {
    return { reply: "Connection offline. Missing parameters." };
  }

  const secureToken = generateViewerToken();
  const lowerCaseMsg = message.toLowerCase();
  const isAskingForGBP = lowerCaseMsg.includes("gbp") || lowerCaseMsg.includes("google business profile presentation") || lowerCaseMsg.includes("iws presentation") || lowerCaseMsg.includes("iws slides") || lowerCaseMsg.includes("zero click") || lowerCaseMsg.includes("ai overview");
  const docParam = isAskingForGBP ? "&doc=gbp" : "";
  const secureLink = `${BASE_URL}${VIEWER_PATH}?id=${secureToken}${docParam}`;
  
  await db.collection("secure_access_sessions").doc(secureToken).set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000)
  });

  const SYSTEM_PROMPT = `You are Smart Marketing Chat, the official digital marketing assistant for Happy Hunter Digital. 
 YOUR KNOWLEDGE BASE:
 - Founder & Head Strategist: Thabo Motsumi. Contact: WhatsApp +27 (0) 60 101 6673.
 - Mission: We stop South African SMEs from being "Ghosts" to AI algorithms.
 - Primary Tool: The "Smart Marketing Scan" (provides a Digital Survival Score). Tell users to go to happyhunterdigital.com/audit.
 
 NEW ASSET: "happyhunterdigital AI & Google Business Profile Zero Clicks Revolutions". This guide explains how businesses are losing visibility to Google's AI Overviews and how to fix it.

 RULES:
 1. SMART Q&A: Answer questions intelligently.
 2. ALWAYS state the lowest price using the exact phrase: "starting from" when discussing services.
 3. DO NOT use markdown asterisks. Use HTML tags (<strong>, <p>, <a>, <br>) for ALL formatting. 
 4. DOCUMENT ACCESS: If the user asks for a guide, document, presentation, or access code, provide this exact unique, 24-hour secure link: <a href="${secureLink}">${secureLink}</a>.`;

  try {
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${G_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts:[{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        safetySettings: SAFETY_SETTINGS,
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
      })
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error(`Gemini Chat API Error:`, errorText);
      return { reply: "My neural link is currently overloaded. Please email HQ." };
    }

    const data = await aiRes.json() as any;
    if (data.candidates && data.candidates[0].content.parts[0].text) return { reply: data.candidates[0].content.parts[0].text.trim() };
    return { reply: "I received an unreadable signal from the core. Try again." };
  } catch (e) {
    return { reply: "Comms offline. Please email motsumitl@happyhunterdigital.com" };
  }
});

// ==========================================
// 3. LANDING PAGE SERVICE REQUEST (AUTO EMAIL)
// ==========================================
export const submitServiceRequest = onCall({
  region: "us-central1",
  cors: true,
  secrets: ["GEMINI_API_KEY"]
}, async (request) => {
  const { name, website, service, email } = request.data;
  if (!name || !email || !service) throw new HttpsError("invalid-argument", "Missing required fields.");

  try {
    await db.collection("leads").add({
      name,
      website: website || "Not provided",
      service,
      email,
      source: "AI Megaphone Landing Page",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    let dynamicProblem = "";
    if (service.includes("RAG-Ready") || service.includes("Agentic Web Hub") || service.includes("Digital Front Door")) {
      dynamicProblem = "Your brand is present online, but AI models like Gemini and ChatGPT aren't citing you as the expert source yet.";
    } else if (service.includes("Governance") || service.includes("Local Authority")) {
      dynamicProblem = "Your digital footprint is fragmented, making it hard for both Google and potential customers to verify that you're the safest choice.";
    } else if (service.includes("Chatbot") || service.includes("Automation")) {
      dynamicProblem = "You have traffic, but your team is losing leads because you don't have a 24/7 intelligent system to capture and qualify them instantly.";
    } else {
      dynamicProblem = "You have digital assets, but they aren't working together as a cohesive ecosystem to attract, convert, and retain high-value clients.";
    }

    const firstName = htmlescape(name.split(' ')[0] || '');
    const emailHtml = `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
  <p style="font-size: 16px;">Hi ${firstName || 'there'},</p>
  <p style="font-size: 16px;">Welcome to the hunt for smarter growth.</p>
  <p style="font-size: 16px;">I noticed you were looking into <strong>${htmlescape(service)}</strong>. Most businesses come to us because they realize that simply "ranking" on page one isn't enough anymore. In 2026, if you aren't being synthesized into the answers provided by AI assistants, you're effectively invisible.</p>

  <h3 style="color: #000; margin-top: 30px;">The Problem We Identified:</h3>
  <p style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #eab308; margin-bottom: 20px; font-size: 16px; border-radius: 0 8px 8px 0;">
    Based on your interest, it sounds like you're facing a common challenge:<br/><br/><strong>${dynamicProblem}</strong>
  </p>

  <h3 style="color: #000; margin-top: 30px;">How Happy Hunter Solves This:</h3>
  <p style="font-size: 16px;">We don't just "do marketing." We build a Smart Authority Ecosystem for you. By applying our Digital Entity Management & Optimization (DEMO) framework, we ensure that:</p>
  <ul style="font-size: 16px; margin-bottom: 30px;">
    <li style="margin-bottom: 10px;"><strong>You are Verified:</strong> Your digital passport is flawless.</li>
    <li style="margin-bottom: 10px;"><strong>You are Recommended:</strong> AI engines cite you as the authority.</li>
    <li><strong>You are Automated:</strong> Leads are converted while you sleep.</li>
  </ul>

  <div style="background-color: #050505; color: #fff; padding: 30px; text-align: center; border-radius: 12px; margin-top: 40px;">
    <h3 style="color: #eab308; margin-top: 0;">What's Next?</h3>
    <p style="color: #d1d5db; margin-bottom: 25px;">Our system has already started a preliminary scan of your digital entity. I'd love to walk you through the results.</p>
    <a href="https://calendly.com/motsumitl/30min" style="background-color: #eab308; color: #000; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Book a Free Discovery Call</a>
  </div>

  <p style="margin-top: 40px; font-size: 16px;">Stay Smart,<br/><br/><strong>Thabo Leslie Motsumi</strong><br/><span style="color: #666; font-size: 14px;">Happy Hunter -Smart Marketing-</span></p>
</div>`;

    await db.collection("mail").add({
      to: [email],
      message: {
        subject: `Regarding your interest in ${htmlescape(service)} – Let's solve the "Invisibility" problem.`,
        html: emailHtml
      }
    });

    return { success: true };
  } catch (error: any) {
    throw new HttpsError("internal", `System Engine Failed. ${error.message}`);
  }
});

// ============================================================================
// BRAND SCHEMA COMPILER (Firestore Trigger)
// ============================================================================
export const compileEntitySchema = onDocumentWritten("brand_identity/{docId}", async () => {
  try {
    const brandSnapshot = await db.collection("brand_identity").limit(1).get();
    if (brandSnapshot.empty) return null;
    const brandData = brandSnapshot.docs[0].data();
    const masterSchema = {
      "@context": "https://schema.org",
      "@graph": [{
        "@type": brandData.orgType || "LocalBusiness",
        "name": brandData.legalName || "Happy Hunter Digital"
      }]
    };
    await db.collection("public_seo").doc("master_schema").set({
      compiled_json_ld: JSON.stringify(masterSchema),
      last_updated: admin.firestore.FieldValue.serverTimestamp()
    });
    return null;
  } catch (error) { return null; }
});

// ============================================================================
// 3b. PLAYBOOK DOWNLOAD (Email + WhatsApp Delivery)
// ============================================================================
export const submitPlaybookRequest = onCall({
  region: "us-central1",
  cors: true,
  maxInstances: 10,
  secrets: ["GEMINI_API_KEY", "WHATSAPP_TOKEN", "PHONE_NUMBER_ID"]
}, async (request) => {
  const { email, whatsapp } = request.data;
  if (!email) throw new HttpsError("invalid-argument", "Email is required.");

  try {
    // Backstop limit: the same email may only request the playbook twice.
    // (The frontend also enforces a per-computer counter in localStorage;
    // this guards against storage being cleared.)
    const PLAYBOOK_MAX_PER_EMAIL = 2;
    const existing = await db.collection("leads")
      .where("source", "==", "Playbook Download")
      .where("email", "==", email)
      .count()
      .get();
    if (existing.data().count >= PLAYBOOK_MAX_PER_EMAIL) {
      throw new HttpsError(
        "resource-exhausted",
        "This email has already received the playbook twice. Check your inbox or WhatsApp for the link."
      );
    }

    await db.collection("leads").add({
      email,
      whatsapp: whatsapp || null,
      source: "Playbook Download",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Use GitHub raw content URL for direct download (no GitHub UI)
    const PDF_URL = "https://github.com/happyhunterdigital/Happy-Hunter-Digital--Smart-Marketing-/raw/main/public/assets/happyhunterdigital%20The%202026%20AI%20Marketing%20playbook.pdf";
    // Fallback: Google Drive if GitHub fails
    const GDRIVE_URL = "https://drive.google.com/uc?export=download&id=1Z1ertjwHPoxx-0UROVAKhlzKHvTDqme7";

    const emailHtml = `<div style="font-family: Arial, sans-serif; background-color: #050505; color: #fff; padding: 40px; text-align: center;">
  <h1 style="color: #eab308; margin-bottom: 20px;">Your 2026 AI Marketing Playbook</h1>
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #d1d5db;">Here's your free playbook with GEO templates, schema checklists, WhatsApp automation flows, and AI visibility testing prompts.</p>
  <a href="${PDF_URL}" download style="background-color: #eab308; color: #000; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Download Playbook (PDF)</a>
  <p style="margin-top: 20px; font-size: 12px; color: #666;">Having trouble? <a href="${GDRIVE_URL}" style="color: #eab308; text-decoration: underline;">Download from Google Drive instead</a></p>
  <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
    <h3 style="color: #eab308; margin-top: 0;">What's Inside?</h3>
    <ul style="color: #d1d5db; text-align: left; max-width: 400px; margin: 0 auto; line-height: 2;">
      <li>GEO Templates (copy + paste)</li>
      <li>Schema Markup Checklists</li>
      <li>WhatsApp Automation Blueprint</li>
      <li>AI Visibility Testing Prompts</li>
      <li>Local SEO vs AI-Ready Comparison</li>
    </ul>
  </div>
  <p style="margin-top: 40px; font-size: 14px; color: #666;">Need help implementing? Reply to this email or book a free discovery call.</p>
  <a href="https://calendly.com/motsumitl/30min" style="background-color: transparent; color: #eab308; padding: 12px 24px; text-decoration: none; font-weight: bold; border: 1px solid #eab308; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; margin-top: 20px;">Book a Free Call</a>
</div>`;

    await db.collection("mail").add({
      to: [email],
      message: {
        subject: "Your 2026 AI Marketing Playbook — Free Download",
        html: emailHtml
      }
    });

    if (whatsapp) {
      try {
        const cleanPhone = whatsapp.replace(/[^0-9+]/g, '');
        const docUrl = PDF_URL;
        
        await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "interactive",
          interactive: {
            type: "cta_url",
            header: { type: "text", text: "2026 AI Marketing Playbook" },
            body: { text: "Here's your free playbook. Tap below to download.\n\nIf link doesn't work: https://drive.google.com/uc?export=download&id=1Z1ertjwHPoxx-0UROVAKhlzKHvTDqme7" },
            footer: { text: "happyhunterdigital.com" },
            action: {
              name: "cta_url",
              parameters: { display_text: "Download Playbook", url: docUrl }
            }
          }
        }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
      } catch (waErr: any) {
        console.error("WhatsApp playbook delivery failed:", waErr.message);
      }
    }

    try {
      const adminMsg = `📥 *NEW PLAYBOOK DOWNLOAD*\n\n*Email:* ${email}\n*WhatsApp:* ${whatsapp || 'Not provided'}`;
      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: ADMIN_NUMBER,
        text: { body: adminMsg }
      }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
    } catch (err) { console.error("Admin notification failed:", err); }

    return { success: true };
  } catch (e: any) {
    throw new HttpsError("internal", `Playbook delivery failed. ${e.message}`);
  }
});

// ============================================================================
// 3c. WEBSITE CHATBOT LEAD (Conversational multi-step form capture)
// ============================================================================
export const submitChatbotLead = onCall({
  region: "us-central1",
  cors: true,
  maxInstances: 10,
  secrets: ["CRM_INGEST_URL", "CRM_INGEST_SECRET", "WHATSAPP_TOKEN", "PHONE_NUMBER_ID"],
}, async (request) => {
  const { name, whatsapp, email, service, business, timeline, budget } = request.data ?? {};
  if (!name || (!whatsapp && !email) || !service) {
    throw new HttpsError("invalid-argument", "Missing contact details or service selection.");
  }

  try {
    await db.collection("leads").add({
      name,
      whatsapp: whatsapp || null,
      email: email || null,
      service,
      business: business || null,
      timeline: timeline || null,
      budget: budget || null,
      source: "Website Chatbot",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    const auditDomain = (email && email.includes("@") ? email.split("@")[1] : null)
      || (business ? business.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".co.za" : "chatbot.smartmarketing.local");
    void relayAuditToCrm({
      domain: auditDomain,
      companyName: business || null,
      contactName: name,
      contactEmail: email || null,
      contactPhone: whatsapp || null,
    });

    const alertText = `NEW CHATBOT LEAD\n\nFROM: ${name}\nSERVICE: ${service}\nBUSINESS: ${business || "n/a"}\nTIMELINE: ${timeline || "n/a"}\nBUDGET: ${budget || "n/a"}\nCONTACT: ${whatsapp || email}\n\nFollow up now!`;
    try {
      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: ADMIN_NUMBER,
        text: { body: alertText }
      }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
    } catch (err) { console.error("Chatbot lead alert failed:", err); }

    return { success: true };
  } catch (e: any) {
    throw new HttpsError("internal", `Chatbot lead capture failed. ${e.message}`);
  }
});

// ============================================================================
// 4. WHATSAPP WEBHOOK
// ============================================================================
export const whatsappWebhook = onRequest({ secrets: ["WHATSAPP_TOKEN", "PHONE_NUMBER_ID", "VERIFY_TOKEN", "GEMINI_API_KEY", "WHATSAPP_APP_SECRET", "CRM_INGEST_URL", "CRM_INGEST_SECRET"] }, async (req, res) => {
  if (req.method === 'GET') {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
      res.status(200).send(req.query['hub.challenge']);
    } else {
      res.status(403).send('Verification failed');
    }
    return;
  }

  if (req.method === 'POST') {
    if (!verifyWhatsAppSignature(req)) {
      res.status(401).send('Invalid signature');
      return;
    }

    if (req.body?.object === 'whatsapp_business_account') {
      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      // Guided conversational multi-step form (progressive disclosure survey)
      {
        const flowText: string | null =
          message?.type === "text" ? message.text.body :
          message?.type === "interactive" && message.interactive?.button_reply ? message.interactive.button_reply.title : null;
        const flowButtonId: string | null =
          message?.type === "interactive" && message.interactive?.button_reply ? message.interactive.button_reply.id : null;

        if (message?.type === "text" || message?.type === "interactive") {
          const flowResult = await handleFlowMessage({ from: message.from, text: flowText, buttonId: flowButtonId });
          if (flowResult.handled) {
            void relayToCrm({ phone: message.from, text: flowText || "(button tap)", direction: "inbound" });
            res.status(200).send('EVENT_RECEIVED');
            return;
          }
        }
      }

      if (message?.type === "system" && message.system?.type === "group_membership_change") {
        const newUser = message.from;
        const onboardingDoc = await db.collection("verified_claims").where("category", "==", "onboarding").limit(1).get();

        if (!onboardingDoc.empty) {
          const welcomeMessage = `Welcome to Happy Hunter Digital.\n\nWe are pleased to have you join our Smart Marketing community. This space is designed to provide you with the latest insights into AEO, SEO, and Agentic Revenue Automation.\n\nTo get started, feel free to ask me about our services or browse our latest case studies. How can we assist your business today?`;
          try {
            await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
              messaging_product: "whatsapp",
              to: newUser,
              text: { body: welcomeMessage }
            }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
          } catch (err) { console.error("Onboarding Error", err); }
        }

      } else if (message && message.type === 'text') {
        const userText: string = message.text.body;
        const from: string = message.from;
        const pushName: string | null = value?.contacts?.[0]?.profile?.name ?? null;
        const messageId = message.id ?? null;
        const timestamp = message.timestamp ?? null;
        const G_KEY = process.env.GEMINI_API_KEY;

        void relayToCrm({
          phone: from,
          name: pushName,
          text: userText,
          direction: "inbound",
          externalMessageId: messageId,
          timestamp: timestamp ? Number(timestamp) : null,
        });

        let botResponse = "System updating. Please contact our strategist: https://wa.me/27601016673";
        let matchedData: any = null;

        const sessionRef = db.collection('whatsapp_sessions').doc(from);
        const sessionDoc = await sessionRef.get();
        let chatHistory: any[] = sessionDoc.exists ? sessionDoc.data()?.history || [] : [];

        if (G_KEY && userText) {
          try {
            const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${G_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: `models/${EMBEDDING_MODEL}`,
                content: { parts: [{ text: userText.toLowerCase() }] }
              })
            });
            const embedData = await embedRes.json() as any;
            if (embedData.embedding?.values) {
              const vectorQuery = await db.collection('verified_claims').findNearest(
                'embedding_vector',
                admin.firestore.FieldValue.vector(embedData.embedding.values),
                { limit: 1, distanceMeasure: 'COSINE' }
              ).get();
              if (!vectorQuery.empty) matchedData = vectorQuery.docs[0].data();
            }
          } catch (e) { console.error("Embedding Error", e); }
        }

        if (matchedData) {
          const data = matchedData;

          if (data.category === "price" || data.category === "service") {
            await db.collection("prospects").doc(from).set({
              phone: from,
              interest: data.category,
              last_inquiry: userText,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              status: "new_lead"
            }, { merge: true });

            const alertText = `NEW HIGH-VALUE LEAD\n\nFROM: ${from}\nINTERESTED IN: ${data.category}\nMESSAGE: "${userText}"\n\nCheck Firestore now to follow up!`;
            try {
              await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
                messaging_product: "whatsapp",
                to: ADMIN_NUMBER,
                text: { body: alertText }
              }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
            } catch (err) { console.error("Admin Alert Failed", err); }
          }

          if (data.category === "onboarding") {
            botResponse = `WELCOME TO THE SMART MARKETING TRIBE!\n\nWe are excited to have you.\n${data.content}\n\nIntroduce yourself once you're in!`;
          } else if (data.category === 'blog') {
            botResponse = `INSIGHT SNIPPET:\n\n${data.snippet}\n\nRead the full article here: ${data.url}`;
          } else {
            botResponse = `OFFICIAL INFO:\n\n${data.content || data.verified_answer}`;
          }

          if (data.media_url) {
            try {
            await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
              messaging_product: "whatsapp",
              to: from,
              type: "image",
              image: { link: data.media_url, caption: botResponse }
            }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });

            void relayToCrm({ phone: from, text: botResponse, direction: "outbound" });

              chatHistory.push({ role: "user", text: userText });
              chatHistory.push({ role: "model", text: botResponse });
              if (chatHistory.length > 10) chatHistory = chatHistory.slice(chatHistory.length - 10);
              await sessionRef.set({ history: chatHistory, last_updated: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

              res.status(200).send('EVENT_RECEIVED');
              return;
            } catch (mediaError) { console.error("Media Send Error:", mediaError); }
          }

        } else if (G_KEY) {
          const WA_SYSTEM_PROMPT = `You are Smart Marketing Chat, the official digital marketing assistant for Happy Hunter Digital, powered by Smart-Marketing.

YOUR KNOWLEDGE BASE & IDENTITY:
- Founder & Head Strategist: Thabo Motsumi. Direct Link: https://wa.me/27601016673
- Mission: We stop South African SMEs from being "Ghosts" to AI algorithms.

YOUR CATALOG:
1. Entity Architecture (Agentic Websites).
2. Entity Governance (AEO Retainers).
3. Agentic Social Media Ads.
4. Intelligent WhatsApp Bots.
5. Standalone Smart Services (Google Setup, Audits, etc.)

RULES:
1. GREETINGS: If the user says "Hi" or asks what you do, reply with a welcoming message and a clean, numbered list of the 5 catalog items WITHOUT PRICES. Ask them to "Reply with a number to learn more."
2. PRICING: ONLY reveal prices if specifically asked. ALWAYS use the exact phrase "starting from".
3. FORMATTING: Do NOT use markdown asterisks. Use basic text formatting only.
4. DOCUMENT ACCESS: If the user asks for a guide, document, or presentation, DO NOT output a URL. Instead, you MUST include the exact tag [SEND_DOC_GBP] if they want the Google Business Profile guide, or [SEND_DOC_SERVICES] if they want the Service & Pricing guide.`;

          const formattedHistory = chatHistory.map((msg: any) => ({
            role: msg.role,
            parts: [{ text: msg.text }]
          }));
          formattedHistory.push({ role: "user", parts: [{ text: userText }] });

          try {
            const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${G_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: WA_SYSTEM_PROMPT }] },
                contents: formattedHistory,
                safetySettings: SAFETY_SETTINGS,
                generationConfig: { temperature: 0.2, maxOutputTokens: 300 }
              })
            });
            const data = await aiRes.json() as any;
            if (data.candidates && data.candidates[0].content.parts[0].text) {
              botResponse = data.candidates[0].content.parts[0].text.trim();
            }
          } catch (fallbackErr) { console.error("Generative Fallback Error:", fallbackErr); }
        }

        // ============================================================
        // WHATSAPP DOCUMENT INTERCEPTOR
        // ============================================================
        let sendGbpDoc = false;
        let sendServicesDoc = false;

        if (botResponse.includes("[SEND_DOC_GBP]")) {
          sendGbpDoc = true;
          botResponse = botResponse.replace("[SEND_DOC_GBP]", "").trim();
        }
        if (botResponse.includes("[SEND_DOC_SERVICES]")) {
          sendServicesDoc = true;
          botResponse = botResponse.replace("[SEND_DOC_SERVICES]", "").trim();
        }

        chatHistory.push({ role: "user", text: userText });
        chatHistory.push({ role: "model", text: botResponse || "Document prepared." });
        if (chatHistory.length > 10) chatHistory = chatHistory.slice(chatHistory.length - 10);
        await sessionRef.set({ history: chatHistory, last_updated: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

        // Step 1: Send the AI conversational text response
        if (botResponse) {
          try {
            await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
              messaging_product: "whatsapp",
              to: from,
              text: { body: botResponse }
            }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });

            void relayToCrm({ phone: from, text: botResponse, direction: "outbound" });
          } catch (sendError: any) { console.error("WhatsApp Text Error:", sendError.message); }
        }

        // Step 2: Send native WhatsApp CTA button with absolute document link
        if (sendGbpDoc || sendServicesDoc) {
          const docName = sendGbpDoc ? "AI & GBP Zero Clicks Revolutions Guide" : "Smart Marketing Service Guide";
          
          const secureToken = generateViewerToken();
          const docParam = sendGbpDoc ? "&doc=gbp" : "";
          const viewerUrl = `${BASE_URL}${VIEWER_PATH}?id=${secureToken}${docParam}`;

          const interactivePayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "interactive",
            interactive: {
              type: "cta_url",
              header: { type: "text", text: docName },
              body: { text: "Your secure access is ready. Tap below to authenticate and view. This link self-destructs in 24 hours." },
              footer: { text: "happyhunterdigital.com" },
              action: {
                name: "cta_url",
                parameters: { display_text: "View Document", url: viewerUrl }
              }
            }
          };

          try {
            await db.collection("secure_access_sessions").doc(secureToken).set({
              phoneNode: from,
              document: sendGbpDoc ? "gbp" : "services",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000)
            });

            await axios.post(
              `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
              interactivePayload,
              { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
            );
          } catch (e: any) { console.error("CTA Send Error", e.message); }
        }
      }

      res.status(200).send('EVENT_RECEIVED');
      return;
    }
  }

  res.status(404).send();
  return;
});


// ============================================================================
// 5. DAILY REVENUE REPORT (Scheduled)
// ============================================================================
export const dailyRevenueReport = onSchedule({ schedule: "every day 08:00", secrets: ["WHATSAPP_TOKEN", "PHONE_NUMBER_ID", "ADMIN_WHATSAPP_NUMBER"] }, async () => {
  const yesterday = admin.firestore.Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  const snapshot = await db.collection("prospects").where("timestamp", ">", yesterday).get();
  if (snapshot.size > 0) {
    const reportText = `DAILY REVENUE REPORT\n\nTotal New Leads: ${snapshot.size}`;
    try {
      if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
        await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
          messaging_product: "whatsapp",
          to: ADMIN_NUMBER,
          text: { body: reportText }
        }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
      }
    } catch (err) { console.error("Report Failed", err); }
  }
});


// ============================================================================
// 6. VECTOR EMBEDDER (Firestore Trigger)
// ============================================================================
export const vectorizeClaim = onDocumentWritten("verified_claims/{docId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!after || !after.content) return;
  // Guard against infinite loop: skip if content hasn't changed and embedding already exists
  if (after.embedding_vector && (!before || before.content === after.content)) return;
  const G_KEY = process.env.GEMINI_API_KEY;
  if (!G_KEY) return;
  try {
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${G_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text: after.content }] }
      })
    });
    const data = await aiRes.json() as any;
    if (data.embedding?.values) {
      await event.data?.after.ref.update({
        embedding_vector: admin.firestore.FieldValue.vector(data.embedding.values)
      });
    }
  } catch (error) { console.error("Vectorization Failed:", error); }
});

export const notifyNewTaskAssignment = onDocumentCreated({ document: "workspace_tasks/{taskId}", secrets: ["WHATSAPP_TOKEN", "PHONE_NUMBER_ID"] }, async (event) => {
  const snap = event.data;
  if (!snap) return;
  const task = snap.data();
  
  const phones = [];
  if (task.assigneePhone) phones.push(task.assigneePhone);
  if (task.coAssigneePhone) phones.push(task.coAssigneePhone);
  
  if (phones.length === 0) return;

  const messagesToSend = phones.map(phone => {
    const messagePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "text",
      text: {
        body: `🚨 *HQ DIRECTIVE ASSIGNED*\n\n*Objective:* ${task.title}\n*Priority:* ${task.priority}\n*Deadline:* ${task.deadline}\n\nLog into Unified Command to update your SITREP.`
      }
    };

    return axios.post(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      messagePayload,
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    ).catch(e => console.error("Failed to route WhatsApp payload:", e));
  });
  
  await Promise.all(messagesToSend);
});

export const notifyTaskUpdate = onDocumentUpdated({ document: "workspace_tasks/{taskId}", secrets: ["WHATSAPP_TOKEN", "PHONE_NUMBER_ID"] }, async (event) => {
  const newValue = event.data?.after.data();
  const previousValue = event.data?.before.data();
  
  if (!newValue || !previousValue) return;

  const phones = [];
  if (newValue.assigneePhone) phones.push(newValue.assigneePhone);
  if (newValue.coAssigneePhone) phones.push(newValue.coAssigneePhone);
  
  if (phones.length === 0) return;

  if (newValue.status !== previousValue.status) {
    const messagesToSend = phones.map(phone => {
      const messagePayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          body: `⚡ *STATUS UPDATE*\n\n*Objective:* ${newValue.title}\n*New Status:* [${newValue.status}]\n\nMatrix updated successfully.`
        }
      };

      return axios.post(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        messagePayload,
        { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
      ).catch(e => console.error("Failed to route update payload:", e));
    });
    
    await Promise.all(messagesToSend);
  }
});

export const chronologicalAIManager = onSchedule({ schedule: "every day 08:00", secrets: ["WHATSAPP_TOKEN", "PHONE_NUMBER_ID", "ADMIN_WHATSAPP_NUMBER"] }, async () => {
   const today = new Date().toISOString().split('T')[0];
   
   const tasksRef = db.collection("workspace_tasks");
   const snapshot = await tasksRef.where("status", "!=", "Complete").get();

   const messagesToSend: Promise<any>[] = [];

   snapshot.forEach(doc => {
     const task = doc.data();
     const phones = [];
     if (task.assigneePhone) phones.push(task.assigneePhone);
     if (task.coAssigneePhone) phones.push(task.coAssigneePhone);

     if (task.deadline === today && phones.length > 0) {
        phones.forEach(phone => {
            const messagePayload = {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: phone,
              type: "text",
              text: {
                body: `⚠️ *DEADLINE WARNING*\n\n*Objective:* ${task.title}\n*Status:* ${task.status}\n\nThis directive is due TODAY. Ensure execution parameters are met.`
              }
            };

            messagesToSend.push(
              axios.post(
                `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
                messagePayload,
                { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
              ).catch(e => console.error("Chronological AI Error:", e))
            );
        });
     }
   });

   await Promise.all(messagesToSend);
});

// ============================================================================
// 8. CRM SEND — Smart Marketing CRM → WhatsApp
// ============================================================================
// The CRM calls this to reply from a contact's record. Guard it with the shared
// CRM_BOT_SECRET; when it is unset this refuses everything (fail closed).
export const sendFromCrm = onRequest({
  secrets: ["WHATSAPP_TOKEN", "PHONE_NUMBER_ID", "CRM_BOT_SECRET", "CRM_INGEST_URL", "CRM_INGEST_SECRET"],
}, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const secret = process.env.CRM_BOT_SECRET || "";
  const presented = String(req.headers['x-crm-bot-secret'] ?? "");
  if (!secret || presented.length !== secret.length ||
      Buffer.from(presented).equals(Buffer.from(secret)) === false) {
    res.status(403).send('Forbidden');
    return;
  }

  const to: string = typeof req.body?.to === 'string' ? req.body.to : "";
  const text: string = typeof req.body?.text === 'string' ? req.body.text.trim() : "";

  if (!to || !text) {
    res.status(400).send('Missing to or text.');
    return;
  }

  try {
    const metaRes = await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to,
      text: { body: text }
    }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });

    const messageId = metaRes.data?.messages?.[0]?.id ?? null;

    void relayToCrm({
      phone: to,
      text,
      direction: "outbound",
      externalMessageId: messageId,
      timestamp: Date.now(),
    });

    res.status(200).json({ ok: true, messageId });
  } catch (err: any) {
    console.error("[sendFromCrm] WhatsApp send failed:", err.response?.data || err.message);
    const detail = err.response?.data?.error?.message ?? "WhatsApp send failed";
    res.status(502).json({ ok: false, error: detail });
  }
});


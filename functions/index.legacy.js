const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");

admin.initializeApp();
const db = admin.firestore();

const AI_MODEL = "gemini-3.7-flash";

function sanitizeInput(input, maxLen) {
  if (!input || typeof input !== "string") return "";
  return input.trim().slice(0, maxLen).replace(/[<>]/g, "");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidFetchUrl(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return false;
    if (host.startsWith("169.254.") || host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("172.")) return false;
    return /^[a-zA-Z0-9.-]+\.[a-z]{2,}$/.test(host);
  } catch {
    return false;
  }
}

exports.performAudit = onCall({
  region: "us-central1",
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 300,
}, async (request) => {
  const rawBusinessName = request.data?.businessName;
  const rawLocation = request.data?.location;
  const rawClientEmail = request.data?.clientEmail;

  const businessName = sanitizeInput(rawBusinessName, 200);
  const location = sanitizeInput(rawLocation, 200);
  const clientEmail = (rawClientEmail || "").trim().toLowerCase().slice(0, 254);

  const G_KEY = process.env.GEMINI_API_KEY;
  const P_KEY = process.env.PLACES_API_KEY;

  if (!businessName || !location || !clientEmail) throw new HttpsError("invalid-argument", "Missing required fields.");
  if (!validateEmail(clientEmail)) throw new HttpsError("invalid-argument", "Invalid email format.");
  if (!G_KEY || !P_KEY) throw new HttpsError("failed-precondition", "AI Core Offline. Missing API keys.");

  try {
    const getPlaces = async (query) => {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": P_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount,places.websiteUri,places.formattedAddress,places.internationalPhoneNumber",
        },
        body: JSON.stringify({ textQuery: query }),
      });
      return res.json();
    };

    let pData = await getPlaces(`${businessName} in ${location}`);
    let biz = pData?.places?.[0] || null;

    if (!biz) {
      pData = await getPlaces(businessName);
      biz = pData?.places?.[0] || null;
    }

    const websiteUrl = biz?.websiteUri || null;
    let detectedSchemas = [];
    let hasSchema = false;

    if (websiteUrl && isValidFetchUrl(websiteUrl)) {
      try {
        const webRes = await axios.get(websiteUrl, {
          timeout: 6000,
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        });
        const $ = cheerio.load(webRes.data);

        $('script[type="application/ld+json"]').each((_, element) => {
          hasSchema = true;
          try {
            const jsonData = JSON.parse($(element).html() || "{}");
            const extractType = (obj) => {
              if (!obj) return;
              if (Array.isArray(obj)) {
                obj.forEach(extractType);
              } else if (typeof obj === "object") {
                if (obj["@type"]) detectedSchemas.push(obj["@type"]);
                if (obj["@graph"]) extractType(obj["@graph"]);
              }
            };
            extractType(jsonData);
          } catch {}
        });

        detectedSchemas = [...new Set(detectedSchemas)];
        if (detectedSchemas.length === 0 && hasSchema) detectedSchemas = ["Valid Schema (Unknown Type)"];
      } catch {
        console.log("Web scrape failed or timed out for:", websiteUrl);
      }
    }

    const schemaString = detectedSchemas.length > 0
      ? `Detected JSON-LD Schemas: ${detectedSchemas.join(", ")}`
      : "No Schema Markup detected.";
    const bizNameStr = biz?.displayName?.text || "NONE FOUND";

    let context = "";
    if (!biz) {
      context = `GHOST ENTITY: No Google Maps data found for "${businessName}". No Website verified. ${schemaString}`;
    } else {
      context = `
 - User Searched For: "${businessName}"
 - Google Maps Returned: "${bizNameStr}"
 - Maps Rating: ${biz.rating || 0} (${biz.userRatingCount || 0} reviews)
 - Website Linked in Maps: ${websiteUrl || "NONE LINKED"}
 - ${schemaString}
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
 Truth 2: Mention their Website status (If NO website is linked, state it is a critical algorithmic failure).
 Truth 3: Explicitly list the AI Schema Markup (JSON-LD) types found (${detectedSchemas.join(", ")}) or state it is completely missing.
 `;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${G_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are Hunter AI. Audit: ${businessName}. Data Context: ${context}. ${RUBRIC} Format JSON: { "score": number, "summary": "string", "truths":["string", "string", "string"] }` }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const aiData = await aiRes.json();
    const analysis = JSON.parse(aiData.candidates[0].content.parts[0].text);

    const isHijacked = biz && analysis.score === 0;

    const telemetry = {
      mapsStatus: !biz ? "GHOST (NOT FOUND)" : isHijacked ? "HIJACKED (COMPETITOR FOUND)" : "VERIFIED",
      mapsName: biz?.displayName?.text || null,
      rating: biz?.rating || null,
      reviewCount: biz?.userRatingCount || null,
      gbpOnly: !websiteUrl,
      gbpUrl: biz ? `https://search.google.com/local/reviews?placeid=${biz.place_id || ""}` : "",
      website: websiteUrl || "None Linked",
      schema: hasSchema,
      schemasDetected: detectedSchemas,
    };

    await db.collection("audits").add({
      businessName,
      location,
      email: clientEmail,
      score: analysis.score,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, ...analysis, telemetry };
  } catch (e) {
    throw new HttpsError("internal", `Audit failed: ${e.message}`);
  }
});
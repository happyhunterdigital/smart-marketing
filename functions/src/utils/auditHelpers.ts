import * as admin from "firebase-admin";
import axios from "axios";
import { FieldValue } from "firebase-admin/firestore";
import { PerformanceSignals, SecuritySignals, ScrapedSiteData } from "../services/auditService";

export const isGbpUrl = (url: string): boolean =>
  /maps\.google\.|g\.co\/maps|goo\.gl\/maps|google\.com\/maps/i.test(url);

export const ALLOWED_ORIGINS = [
  "https://happyhunterdigital.com",
  "https://www.happyhunterdigital.com",
  "http://localhost:5173",
  "http://localhost:3000"
];

export const sanitizeInput = (input: string, maxLength: number = 100): string => {
  return input.replace(/[\r\n\t]/g, " ").replace(/[<>{}]/g, "").trim().slice(0, maxLength);
};

export const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

export const isValidDomainOrUrl = (urlStr: string): boolean => {
  return /^(https?:\/\/)?([\da-z-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(urlStr);
};

export const detectGbpViaSearch = async (businessName: string, city: string): Promise<string> => {
  try {
    const query = encodeURIComponent(`${businessName} ${city}`);
    const searchUrl = `https://www.google.com/search?q=${query}&hl=en&gl=za`;
    const res = await axios.get(searchUrl, {
      timeout: 6000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    const html: string = res.data || "";
    const hasKnowledgePanel = [
      "kp-header", "business.site", "maps.google.com", "lAd6b", "addr-container", "YhemCb"
    ].some((signal) => html.includes(signal));

    if (hasKnowledgePanel) return `✅ Google Business Profile detected in search results`;
    
    return `⚠️ No GBP knowledge panel found in Google search for "${businessName} ${city}". This may indicate a missing or unverified GBP listing.`;
  } catch (err: any) {
    console.warn("[detectGbpViaSearch] Google search scrape failed:", err.message);
    return "GBP search check unavailable (rate limited or network error)";
  }
};

export const checkRateLimit = async (identifier: string, maxRequests: number = 3, windowMinutes: number = 60): Promise<boolean> => {
  const db = admin.firestore();
  const ref = db.collection("rate_limits").doc(identifier);
  const windowMs = windowMinutes * 60 * 1000;
  const now = Date.now();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();

    if (!data || now - data.windowStart > windowMs) {
      tx.set(ref, { windowStart: now, count: 1 });
      return true;
    }

    if (data.count >= maxRequests) return false;

    tx.update(ref, { count: FieldValue.increment(1) });
    return true;
  });
};

export const formatPerformanceEvidence = (perf: PerformanceSignals): string => {
  if (perf.performanceScore < 0) return "Performance data unavailable (PSI API unreachable).";
  return `
PILLAR 1 — PERFORMANCE & CORE WEB VITALS (Google PageSpeed Insights - Mobile):
  Lighthouse Performance Score: ${perf.performanceScore}/100
  Lighthouse SEO Score: ${perf.seoScore}/100
  Lighthouse Accessibility Score: ${perf.accessibilityScore}/100
  Lighthouse Best Practices Score: ${perf.bestPracticesScore}/100
  Core Web Vitals:
    LCP (Largest Contentful Paint): ${perf.coreWebVitals.lcp >= 0 ? perf.coreWebVitals.lcp + "s" : "N/A"}
    CLS (Cumulative Layout Shift): ${perf.coreWebVitals.cls >= 0 ? perf.coreWebVitals.cls : "N/A"}
    INP (Interaction to Next Paint): ${perf.coreWebVitals.inp >= 0 ? perf.coreWebVitals.inp + "ms" : "N/A"}
  Mobile Field Data: ${perf.mobileUsability}`;
};

export const formatSecurityEvidence = (sec: SecuritySignals): string => {
  return `
PILLAR 2 — SSL & SECURITY:
  SSL Certificate: ${sec.hasSSL ? "VALID ✅" : "MISSING ❌"}
  HTTP→HTTPS Redirect: ${sec.sslRedirect ? "ACTIVE ✅" : "MISSING ❌"}
  Security Headers:
    Strict-Transport-Security (HSTS): ${sec.headers.strictTransportSecurity ? "PRESENT ✅" : "MISSING ❌"}
    X-Content-Type-Options: ${sec.headers.xContentTypeOptions ? "PRESENT ✅" : "MISSING ❌"}
    X-Frame-Options: ${sec.headers.xFrameOptions ? "PRESENT ✅" : "MISSING ❌"}
    Content-Security-Policy: ${sec.headers.contentSecurityPolicy ? "PRESENT ✅" : "MISSING ❌"}
  Security Score: ${sec.securityScore}/100`;
};

export const formatSeoEvidence = (scraped: ScrapedSiteData): string => {
  const schemaString = scraped.schemas.length > 0 ? `Detected: ${scraped.schemas.join(", ")}` : "NONE DETECTED ❌";
  const ogTagCount = Object.keys(scraped.ogTags).length;
  const twCardCount = Object.keys(scraped.twitterCard).length;

  return `
PILLAR 3 — SEO META & CONTENT:
  Title: "${scraped.title}" (${scraped.title.length} chars)
  Meta Description: "${scraped.description}" (${scraped.description.length} chars)
  Canonical URL: ${scraped.canonical || "NOT SET"}
  Robots Meta: ${scraped.robotsMeta || "NOT SET"}
  Heading Structure:
    H1 Tags: ${scraped.headingHierarchy.h1.length} found
    H2 Tags: ${scraped.headingHierarchy.h2.length} found
    H3 Tags: ${scraped.headingHierarchy.h3.length} found
  Links: ${scraped.internalLinks} internal, ${scraped.externalLinks} external
  Images: ${scraped.imageCount} total, ${scraped.imagesWithoutAlt} without alt text

PILLAR 4 — SCHEMA MARKUP & AEO READINESS:
  JSON-LD Schemas: ${schemaString}
  llms.txt: ${scraped.hasLlmsTxt ? "FOUND ✅" : "NOT FOUND"}
  LocalBusiness Schema: ${scraped.schemas.some(s => ["LocalBusiness", "Organization", "ProfessionalService"].includes(s)) ? "PRESENT ✅" : "MISSING ❌"}

PILLAR 5 — MOBILE RESPONSIVENESS:
  Viewport Meta Tag: ${scraped.viewport || "MISSING ❌"}

PILLAR 7 — SOCIAL PROOF & ENTITY SIGNALS:
  Open Graph Tags: ${ogTagCount > 0 ? `${ogTagCount} tags detected ✅` : "NONE DETECTED ❌"}
  Twitter Card: ${twCardCount > 0 ? `${twCardCount} tags detected ✅` : "NONE DETECTED ❌"}`;
};

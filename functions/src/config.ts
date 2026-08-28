export const AI_MODEL = "deepseek-chat";
export const EMBEDDING_MODEL = "text-embedding-004";

// CENTRALIZED ENVIRONMENT VARIABLES
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
export const PLACES_API_KEY = process.env.PLACES_API_KEY || "";
export const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || process.env.PLACES_API_KEY || "";
export const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || process.env.META_SYSTEM_TOKEN || "";
export const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";

// SECURITY: No hardcoded fallback values. These tokens verify webhook authenticity —
// a hardcoded default would be readable by anyone with repo access and would let an
// attacker spoof your Meta/WhatsApp webhook. If unset, verification fails closed.
export const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "";
export const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "";

// Smart Marketing CRM channel — the bot relays every inbound/outbound message to
// the CRM's intake, and the CRM sends replies back through `sendFromCrm`.
// Both sides fail closed when these are unset/unmatched.
export const CRM_INGEST_URL = process.env.CRM_INGEST_URL || "";
export const CRM_INGEST_SECRET = process.env.CRM_INGEST_SECRET || "";
export const CRM_BOT_SECRET = process.env.CRM_BOT_SECRET || "";

export const META_PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || "";
export const ADMIN_NUMBER = "27601016673";
export const BASE_URL = "https://happyhunterdigital.com";

// Fail loudly at cold start if critical webhook secrets are missing, rather than
// silently accepting unverified webhook traffic.
if (!DEEPSEEK_API_KEY) {
  console.warn("WARNING: DEEPSEEK_API_KEY env var is not set in config. AI features will fail.");
}
if (!PLACES_API_KEY) {
  console.warn("WARNING: PLACES_API_KEY env var is not set in config. Google Places features will fail.");
}
if (!VERIFY_TOKEN) {
  console.error("CRITICAL: VERIFY_TOKEN env var is not set. WhatsApp webhook verification will fail closed.");
}
if (!META_VERIFY_TOKEN) {
  console.error("CRITICAL: META_VERIFY_TOKEN env var is not set. Meta webhook verification will fail closed.");
}
if (!CRM_INGEST_URL || !CRM_INGEST_SECRET) {
  console.warn("WARNING: CRM_INGEST_URL / CRM_INGEST_SECRET are not set — the Smart Marketing CRM will not see WhatsApp traffic.");
}
if (!CRM_BOT_SECRET) {
  console.warn("WARNING: CRM_BOT_SECRET is not set — sendFromCrm will refuse all requests.");
}

export const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
];

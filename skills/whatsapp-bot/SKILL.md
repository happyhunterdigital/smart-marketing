---
name: whatsapp-bot
description: Deploy, configure, run, or troubleshoot the Happy Hunter WhatsApp Bot — the official Meta WhatsApp Cloud API bot (replaces OpenWA). Use when the user mentions WhatsApp bot, WhatsApp automation, WhatsApp Cloud API, Meta Graph API webhook, whatsappService, whatsappFlow, Chatbot widget, hunterChat, or smart-marketing whatsapp integration.
---

# WhatsApp Bot — Official Meta Cloud API (Happy Hunter Working Env)

**Source of truth (working production env):** `C:\Users\ratik\Documents\GitHub\Happy-Hunter-Digital--Smart-Marketing-\`
This skill is the **complete replacement for `openwa`**. Do NOT use Baileys / whatsapp-web.js / self-hosted OpenWA — this bot uses Meta's **official WhatsApp Cloud API** (`graph.facebook.com/v21.0`) with zero ban risk and is the exact code that powers happyhunterdigital.com.

## What was copied

From `Happy-Hunter-Digital--Smart-Marketing-` → `smart-marketing`:

**Backend (`functions/src/`):**
- `config.ts` — central envs: `WHATSAPP_TOKEN` / `META_SYSTEM_TOKEN`, `PHONE_NUMBER_ID`, `VERIFY_TOKEN`, `META_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` (HMAC `X-Hub-Signature-256`), `ADMIN_NUMBER=27601016673`, `BASE_URL`, `CRM_INGEST_*`, `CRM_BOT_SECRET`
- `data/servicesKnowledge.ts` — single source of truth for pricing/catalog (6 categories). `FULL_KNOWLEDGE_BASE` is injected into both `hunterChat` and the WhatsApp fallback LLM. Mirror of `src/pages/CoreServices/CoreServices.tsx`.
- `services/whatsappService.ts` — `sendWhatsAppText`, `sendWhatsAppDoc` (CTA-url native doc viewer), `sendAdminAlert`, `sendAuditResultToClient` (7-pillar audit → WhatsApp)
- `services/whatsappFlow.ts` — guided multi-step survey (progressive disclosure). Steps: `need → business → timeline → budget → contact_name → contact_wa → done`. Uses native **reply buttons** (max 3 / step) + text shortcuts, persists to `whatsapp_sessions/{phone}`. Trigger words: `menu/start/options/help/get started`.
- `services/whatsappBot.ts` — legacy standalone handler (kept for reference; canonical webhook is now in `src/index.ts:whatsappWebhook`)
- `services/deepseekService.ts` + `services/chatService.ts` — DeepSeek `deepseek-chat` wrapper (system + history → reply)
- `services/crmRelay.ts` — fire-and-forget relay to Happy Hunter CRM (`/internal/whatsapp/intake` + `/internal/crm/audits`), fail-open so CRM outage never takes down the bot. Guarded by `CRM_INGEST_URL` + `CRM_INGEST_SECRET`.
- `services/kgmidService.ts` — resolves `KGMID` (`/g/<id>`) via Places New API + Maps `cid` sheet scrape; evidence surfaced in audit telemetry
- `services/auditService.ts` + `utils/auditHelpers.ts` — 7-pillar scraper (PSI, SSL, SEO, schema/AEO, mobile, GBP, social proof)
- `src/index.ts` — **canonical entry**: `performAudit` (Places + scrape + Gemini `gemini-3.7-flash`), `hunterChat` (`hunterChat` callable for web Chatbot), `submitChatbotLead`, `whatsappWebhook` (GET verify + POST with `whatsappFlow` intercept → verified_claims vector search → Gemini fallback → CTA doc intercept), `sendFromCrm` (CRM→WhatsApp, guarded by `CRM_BOT_SECRET`), plus scheduled jobs & Firestore triggers

**Frontend:**
- `apps/web/components/Chatbot.tsx` — ported from `src/components/Chatbot.tsx` (356 LOC). Flow: `greet → business → timeline → budget → contact → done` + `ai` (freeform). Calls `submitChatbotLead` & `hunterChat` via `firebaseFunctions`. Uses `sanitizeHTML` + `moderateContent`.
- `apps/web/lib/utils/sanitize.ts` + `moderate.ts` — HTML allow-list sanitizer + blacklist moderation (500 char cap)
- Global mount: `apps/web/pages/_app.tsx` now `dynamic(import('../components/Chatbot'))`

## Architecture (official API, NOT Baileys)

```
User WhatsApp → Meta Cloud webhook → Firebase Functions whatsappWebhook (onRequest)
                ├─① whatsappFlow intercept (buttons) → saves lead → admin alert
                ├─② verified_claims vector search (Gemini embedding cosine) → media-aware reply
                └─③ Gemini fallback (WA_SYSTEM_PROMPT) → text → [SEND_DOC_GBP/SERVICES] token → CTA button + secure_access_sessions token (24h)
Web Chatbot → hunterChat (onCall) → Gemini + link [SECURE 24h doc viewer BASE_URL/view/guide?id=...]
           └─ submitChatbotLead → leads collection + admin WhatsApp alert
CRM → sendFromCrm (onRequest, x-crm-bot-secret) → Meta send → relayToCrm outbound mirror
```

No Puppeteer, no QR, no session store. One webhook URL, one phone number ID, one system token.

## Env vars (set as Firebase secrets / .env — no hardcoded fallbacks)

```
# Meta Cloud
WHATSAPP_TOKEN or META_SYSTEM_TOKEN   # system user token for graph API
PHONE_NUMBER_ID                        # from Meta App → WhatsApp → API Setup
VERIFY_TOKEN                           # you choose; must match Meta webhook verify token
WHATSAPP_APP_SECRET                    # Meta App → App Secret → for X-Hub-Signature-256 HMAC verification (fail-closed)
ADMIN_NUMBER / ADMIN_WHATSAPP_NUMBER   # 27601016673 (lead alerts + daily report)
BASE_URL                               # https://happyhunterdigital.com  (for CTA viewer links)
# AI
GEMINI_API_KEY                         # gemini-3.7-flash (audits + whatsapp fallback)
DEEPSEEK_API_KEY                       # deepseek-chat (optional alt LLM)
PLACES_API_KEY / PAGESPEED_API_KEY
# CRM (optional but recommended)
CRM_INGEST_URL / CRM_INGEST_SECRET     # smart-marketing CRM intake
CRM_BOT_SECRET                         # gates sendFromCrm
```

All secrets are declared in `onRequest({ secrets: [...] })` / `onCall`. Missing `VERIFY_TOKEN` / `WHATSAPP_APP_SECRET` fails closed (403/401). Missing `CRM_*` just disables relay (warn, not fail).

## Verify

```bash
cd functions && npm run build   # tsc → lib/
firebase emulators:start --only functions
# Webhook verify:
curl "http://localhost:5001/<project>/us-central1/whatsappWebhook?hub.verify_token=$VERIFY_TOKEN&hub.challenge=123&hub.mode=subscribe"
# CTA / hunterChat:
firebase functions:shell -> hunterChat({message:"hi"})
```

Meta dashboard: App → WhatsApp → Configuration → Webhook URL = `https://<region>-<project>.cloudfunctions.net/whatsappWebhook`, Verify Token = `VERIFY_TOKEN`, subscribe to `messages`.

## CRM wiring

Every inbound/outbound message is `void relayToCrm(...)` (fail-open). CRM replies come via `POST /sendFromCrm` with `x-crm-bot-secret: CRM_BOT_SECRET` → Meta send → outbound relay. This gives the CRM a full mirror without risking bot availability.

## What replaced OpenWA

| Before (OpenWA) | After (this bot) |
|---|---|
| Baileys/whatsapp-web.js, Puppeteer, QR, in-process engines, ban risk | Meta Cloud API — official, no ban risk |
| `ENGINE_TYPE`, `DATABASE_TYPE`, `REDIS`, `S3`, `API_MASTER_KEY` | `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, `VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` |
| `src/engine/`, `src/modules/`, `dashboard/`, `sdk/` (500+ files) | `functions/src/services/whatsappService|Flow` + `src/index.ts:whatsappWebhook` |
| Self-hosted Docker + single-instance constraint | Firebase Functions (serverless, auto-scale) |
| `skills/openwa/SKILL.md` | `skills/whatsapp-bot/SKILL.md` (this file) |

If you see any remaining `openwa` / `OpenWA` / `Baileys` / `whatsapp-web.js` reference outside this file, replace it with the Meta Cloud bot above.

## Files to keep in sync

When `Happy-Hunter-Digital--Smart-Marketing-/src/pages/CoreServices/CoreServices.tsx` pricing changes, update `functions/src/data/servicesKnowledge.ts` (see its header comment) — otherwise bot quotes stale prices. `Chatbot.tsx` flow labels mirror `whatsappFlow.ts` labels; keep `SERVICE_LABELS`/`BUDGET_LABELS` aligned.

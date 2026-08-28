// functions/src/data/servicesKnowledge.ts
//
// Single source of truth for what the chatbots (hunterChat + WhatsApp bot) know
// about Happy Hunter Digital's services and pricing.
//
// IMPORTANT: This is a mirror of src/pages/CoreServices/CoreServices.tsx (the
// `categories` array), which is what actually renders the live /services/*
// pages. The `functions/` project has its own tsconfig with `include: ["src"]`,
// so it cannot import directly from the frontend's `src/` directory. Whenever
// CoreServices.tsx changes (new SKUs, new prices, new categories), update the
// strings below to match, or the bots will quote stale info to customers.
//
// NOTE: src/data/servicesData.ts is an OLDER, separate pricing model (5 phases
// + master retainer tiers) that is now superseded by CoreServices.tsx for the
// main services pages. It's still wired into CoreServicesForm.tsx and
// MegaphoneLanding.tsx as of this writing - if those pages are still live and
// customer-facing, they may be quoting different prices than the chatbots
// below. Worth reconciling separately.

export const COMPANY_INFO = `
- Company: Happy Hunter Digital (happyhunterdigital.com), a South African digital marketing agency based in Pretoria.
- Founder & Head Strategist: Thabo Motsumi.
- Mission: We stop South African SMEs from being "Ghosts" to AI algorithms. We turn physical businesses into digital powerhouses via Generative/Answer Engine Optimization (GEO/AEO).
- Free diagnostic tool: The "Smart Marketing Scan" (gives a Digital Survival Score). Send users to happyhunterdigital.com/audit.
- Contact: WhatsApp +27 60 101 6673 or email motsumitl@happyhunterdigital.com.
`.trim();

// STEP 1 CONTENT: the six service categories with a one-line description each
// and their live page link, but NO prices. This is what the bot should lead
// with when a visitor asks a general "what do you offer" question - list the
// categories and a bit of context, same as the /services overview page does.
export const SERVICE_CATALOG_OVERVIEW = `
OUR SIX SERVICE CATEGORIES (list these with their one-line description when a visitor asks generally what you offer - do NOT include prices at this stage):
1. Digital Marketing - We build campaigns structured around what AI answer engines and search algorithms actually reward: consistency, clarity, and verifiable authority, not just ad spend. (happyhunterdigital.com/services/digital-marketing)
2. Web Development - We build AI-ready websites, structured for AEO and AI SEO, so AI assistants can read, understand, and cite your business, not just rank it in search results. (happyhunterdigital.com/services/web-development)
3. SEO & AI Search Optimisation - Traditional SEO gets you found by Google. AI Search Optimisation gets you recommended by AI. We build for both. (happyhunterdigital.com/services/seo-ai-search)
4. GBP Management - Your Google Business Profile is one of the first places AI systems check to verify a business is real, active, and trustworthy. We keep it accurate and updated. (happyhunterdigital.com/services/google-business-profile)
5. WhatsApp Automation - We turn WhatsApp into an automated sales channel that responds instantly, qualifies leads, and keeps your business always on. (happyhunterdigital.com/services/whatsapp-marketing)
6. Automation & Chatbots - We deploy AI receptionists and workflow automations that qualify leads and answer questions 24/7, so no opportunity goes cold. (happyhunterdigital.com/services/automation-chatbots)
`.trim();

// STEP 2 CONTENT: detailed SKUs and prices per category. Only pull from the
// section matching the category the visitor asked about.
export const SERVICE_CATALOG_DETAIL = `
DETAILED PRICING BY CATEGORY (only share the relevant section once the visitor has told you which category they want, or explicitly asks for full pricing):

[Digital Marketing]
- Social Media Starter: R1,500/month - 8 posts or reels/mo across Facebook & Instagram, community management, monthly reporting, 3-month setup phase.
- Social Media Growth (most popular): R2,800/month - 12 posts or reels/mo across Facebook, Instagram, TikTok, plus retargeting setup.
- Content Marketing: R3,500/month - 4 deep-research SEO/GEO blog articles per month.
- Paid Search & Social Ads: From R2,500/month - Google Ads & Meta Ads campaign setup and management.
- Email Marketing: R1,950/month - automation setup + 4 strategic campaign sends per month.

[Web Development]
- Business / Corporate Website: from R1,850 - packages: 1-Page Starter R1,850 / Business Pack R2,750 / CMS Business Pack R6,500.
- E-Commerce Website (most popular): Starting from R8,500 - full online store, PayFast/Yoco payment integration, real-time inventory.
- Landing Page: Starting from R1,850 - high-conversion single page for campaigns.
- Portfolio / Personal Website: R3,450 once-off.

[SEO & AI Search Optimisation]
- SEO & AI Visibility Audit: R3,950 once-off - full index, schema, and AI-citation health check.
- Technical SEO Management: R2,450/month - ongoing crawlability, speed, and indexing maintenance.
- Entity Authority Building: R3,450/month - verified entity/profile alignment across reference sources.
- GEO & AI Citation Optimisation (most popular): R4,950/month - structuring content for AI citation and direct machine recommendations.

[GBP Management]
- Essential GBP Package: R1,180/month - 2 profile updates/mo, 2 Q&A entries/mo.
- Growth GBP Package (most popular): R2,730/month - 4 updates/mo, 4 Q&A entries/mo, review pipeline, 2 local landing pages.
- Premium GBP Package: R3,950/month - 6 updates/mo, 6 Q&A entries/mo, up to 3 geographic zones, review sentiment audits.

[WhatsApp Automation]
- WhatsApp Ad Campaigns: From R2,500/month - Meta ad campaigns driving traffic into WhatsApp.
- WhatsApp Bot Setup: R4,950 once-off - official Meta Cloud API bot with automated flows.
- WhatsApp Marketing Full Package (most popular): From R6,500/month - ads + automation flows + catalog + tracking combined.

[Automation & Chatbots]
- Website AI Chatbot: From R4,950 once-off - custom chatbot trained on your business documentation.
- CRM & Workflow Automation (most popular): Custom Quote - automated pipelines linking lead capture to your CRM/database.
- AI Voice Agents: From R12,000 once-off - AI phone agent that answers calls, captures details, books appointments.
`.trim();

/** Full knowledge base: category overview + detailed pricing. */
export const FULL_KNOWLEDGE_BASE = `
${COMPANY_INFO}

${SERVICE_CATALOG_OVERVIEW}

${SERVICE_CATALOG_DETAIL}
`.trim();

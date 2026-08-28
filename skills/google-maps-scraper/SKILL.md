---
name: google-maps-scraper
description: Deploy, configure, run, or troubleshoot the Happy Hunter Digital Google Maps Business Auditor — the rebranded fork of omkarcloud/google-maps-scraper used to audit a specific business (usually your own): official name, trade category, street address or service-area boundary, click-to-call phone, website, and ratings. Use when the user mentions auditing a Google Maps/Google Business listing, checking their own business presence, verifying business identity/NAP data (name, address, phone), service-area boundaries, or applying the auditor to one of the happyhunterdigital repos.
---

# Google Maps Business Auditor — Happy Hunter Digital

Audit your own business the way Google sees it. Type your business name and city, and the tool pulls **your** listing back with your official name, trade category, street address (or service-area boundary), click-to-call phone, website, and ratings — straight from the live Google Maps profile.

Rebranded and supported fork of `omkarcloud/google-maps-scraper`, a desktop app built on the Botasaurus framework. Full docs live in this folder:

- `README.md` — quick start, plans, plain-English overview
- `fields.md` — every extracted data field and what it means for an audit
- `advanced.md` — running an audit, finding your listing, troubleshooting
- `server-deployment.md` — run it on a cloud server (AWS/GCP)
- `video-script.md` — ready-to-film marketing script

## What an audit tells you

One search returns **your business record** with the fields that decide whether Google — and its AI answers — can trust you:

- **Business identity** — official business name, primary trade category, physical street address (or your designated service-area boundary).
- **Core contact points** — a direct click-to-call phone number and a link to your website.
- **Ratings** — your average star rating, review count, and what customers say.

If any of these are missing, wrong, or mismatched, that is exactly the gap that keeps a business invisible to AI answers. The audit finds it in one run.

## The three audit questions

1. **Does Google know my official name and category?** (Business identity)
2. **Can a customer click to call me or open my website?** (Core contact points)
3. **Do I have a rating that proves I am real and trusted?** (Ratings)

If the answer to any is no, the listing needs work — claim it, correct the NAP data, fix the phone or website, and grow reviews.

## How to run an audit

1. Install **Google Chrome**.
2. Download the app for your OS from [omkar.cloud](https://www.omkar.cloud/tools/google-maps-extractor).
3. Type your search, e.g. `your business name in your city`, and press **Search**.
4. Find your listing in the results and export it as CSV, JSON, or Excel.
5. Read the record against the three audit questions above.

## Plans

| Plan | Price | Searches/month |
| --- | --- | --- |
| Free | $0 | 200 |
| Starter | $16/month | 5,000 |
| Unlimited | $48/month | Unlimited |

Auditing your own business uses 1 search per listing, so the free plan covers you for years. Enrichment (emails, social profiles) has its own free allowance via omkar.cloud.

## How to help a user

- **Set up:** install the desktop app (Chrome required), verify enrichment via an omkar.cloud API key + phone verification.
- **Run the audit:** search the exact business name + city, locate the record, export it. See `advanced.md`.
- **Check identity:** confirm `NAME`, `MAIN_CATEGORY`, and `ADDRESS` match the registered/official details. For service-area businesses, verify the drawn boundary instead of a street address.
- **Check contact:** confirm `PHONE` (click-to-call) and `WEBSITE` are present and correct.
- **Check ratings:** note `RATING`, `REVIEWS`, and `REVIEW_KEYWORDS` — a weak or empty rating profile is the most common reason AI won't recommend a business.
- **Fix gaps:** claim the listing, correct NAP, add phone/website, and plan a review strategy. `CAN_CLAIM` tells you if the listing is still unclaimed.
- **Export the report:** CSV, JSON, or Excel; uncheck "English conversion" to keep non-Latin characters.

## Troubleshooting cheat-sheet

- **macOS Chrome won't open:** close the app or restart the computer.
- **Search returns other businesses, not yours:** narrow it — use the exact official name plus city, or switch to the Detailed strategy. See `advanced.md`.
- **Non-English characters lost in export:** uncheck "English conversion"; open in Google Sheets if Excel mangles them.
- **Scraping stops overnight:** the machine slept. Set sleep mode to "Never", or run it on a cloud server.
- **Task shows ~80K mid-run, 70K at the end:** Google lists the same places across multiple cities; the tool dedupes.

## Related tools (Happy Hunter Digital suite)

- **Comp AI CRM** — store the audit results and track fixes per business
- **Social Analyzer** — check the same business across 1,000+ social networks
- **WhatsApp Bot** — message the business owner about their audit findings (official Meta Cloud API + CTA-doc delivery)
- **OpenReply** — convert comments into conversations for the audit service
- **OpenMontage** — produce the video content that sells the audit service

## Practical use cases

1. **Audit your own business** — the core case: see exactly what Google shows, find the gaps, fix them.
2. **Audit a client's business** — run the same check for a prospect to prove why they need your service.
3. **Check a supplier or partner** — verify the official name, address, phone, and rating before you deal with them.
4. **Track your listing over time** — run the audit monthly and watch your rating and NAP consistency improve.
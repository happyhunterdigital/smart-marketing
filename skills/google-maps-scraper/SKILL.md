---
name: google-maps-scraper
description: Deploy, configure, run, or troubleshoot the Happy Hunter Digital Google Maps Lead Extractor — the rebranded fork of omkarcloud/google-maps-scraper that turns Google Maps into a business lead list (50+ data points, enrichment, API, AWS/GCP deployment). Use when the user mentions the Google Maps scraper/extractor, Google Business or Maps lead generation, extracting business contacts (phone, website, email, socials), enrichment, or applying the scraper to one of the happyhunterdigital repos.
---

# Google Maps Lead Extractor — Happy Hunter Digital

Turn Google Maps into a sales pipeline. Type any business type and any location, and pull a clean, exportable list of businesses with their contact details and reviews — 50+ data points per record, in real time.

Rebranded and supported fork of `omkarcloud/google-maps-scraper`, a desktop app built on the Botasaurus framework. Full docs live in this folder:

- `README.md` — quick start, plans, plain-English overview
- `fields.md` — every extracted data field and what it is good for
- `advanced.md` — search strategies, filters, enrichment, troubleshooting
- `server-deployment.md` — run it on a cloud server (AWS/GCP)
- `video-script.md` — ready-to-film marketing script

## What it does

- Finds businesses on Google Maps for **any category and location** (restaurants, gyms, agencies, dentists, tech companies, anything).
- Extracts **50+ data points** per business, real time: name, category, phone, website, address, coordinates, rating, reviews, social profiles, hours, media, and more. See `fields.md` for the full schema.
- **Enrichment** adds the missing pieces Google Maps hides — verified emails, decision-maker contacts, social profiles, mobile-vs-landline phone info.
- **Reviews extraction** that works, with review keywords and featured reviews.
- **Built-in API** for Python and Node.js, so leads can feed straight into your own systems or the Smart Marketing dashboard.
- **Server deployment** on AWS/GCP for always-on, unattended scraping.

## Free tier (the real selling point)

- **200 searches/month free**, no credit card. Roughly 16x more generous than the big-name alternatives.
- One search returns **100 to 1,000+ businesses** (10,000+ with the zoom-18 strategy) — about **20,000+ free leads every month**.

## Plans

| Plan | Price | Searches/month |
| --- | --- | --- |
| Free | $0 | 200 |
| Starter | $16/month | 5,000 |
| Unlimited | $48/month | Unlimited |

Charged per search (each yielding 100–1,000+ results), not per result — the lowest cost per lead in the market. Enrichment has its own free allowance (100 credits/month) via omkar.cloud.

## Quick start

1. Install **Google Chrome**.
2. Download the app for your OS from [omkar.cloud](https://www.omkar.cloud/tools/google-maps-extractor).
3. Type your search, e.g. `restaurants in Johannesburg`, and press **Search**.
4. Filter until the list is exactly your target customers, then export as CSV, JSON, or Excel.

## How to help a user

- **Set up:** install the desktop app (Chrome required), verify enrichment via an omkar.cloud API key + phone verification.
- **Choose a strategy:** Fast (default, country-scale), Fastest (speed), Detailed (one city, thorough), By Zoom Level (15–18, maximum results), By Geolocation (drawn polygon/area). See `advanced.md`.
- **Quality a list:** filter for "has phone", "no website", rating/review thresholds — a "no website" business is a live pitch for web and SEO services.
- **Enrich:** enable emails, socials, and decision-maker contacts before export.
- **Export:** CSV, JSON, or Excel; uncheck "English conversion" to keep non-Latin characters.
- **Scale:** deploy to an AWS EC2 / GCP VM, attach a static IP, install via the two commands in `server-deployment.md`, and expose the built-in API.

## Troubleshooting cheat-sheet

- **macOS Chrome won't open:** close the app or restart the computer.
- **Result count drops after a task finishes:** normal — duplicates are removed at the end (expect 20–40% on country-level runs).
- **Non-English characters lost in export:** uncheck "English conversion"; open in Google Sheets if Excel mangles them.
- **Scraping stops overnight:** the machine slept. Set sleep mode to "Never", or run it on a cloud server.
- **Task shows ~80K mid-run, 70K at the end:** Google lists the same places across multiple cities; the tool dedupes.

## Related tools (Happy Hunter Digital suite)

- **Comp AI CRM** — land the extracted leads in an agentic CRM
- **OpenWA** — message leads on WhatsApp at scale
- **OpenReply** — convert Instagram comments into conversations
- **Social Analyzer** — research prospects across 1,000+ sites
- **OpenMontage** — produce the video content that sells the service

## Practical use cases

1. **Find customers for a service** — scrape the niche you sell to, filter, and pitch.
2. **Hire better people** — e.g. search "Sales Training" in a city and ask training centres for their best candidates.
3. **Discover top providers** — highest-rated yoga, libraries, restaurants, computer repair.
4. **Sell websites / SEO** — filter to businesses with no website or weak listings; every row is a prospect.
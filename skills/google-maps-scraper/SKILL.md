# Google Maps Scraper Skill

Deploy, configure, run, or troubleshoot the Google Maps Scraper — an open-source desktop app and API for extracting business leads from Google Maps at scale.

## Overview

This skill helps you work with the **Google Maps Scraper** (originally by omkarcloud, forked to `happyhunterdigital/google-maps-scraper`), a desktop application built on the Botasaurus Desktop framework. It finds business profiles from Google Maps for any category and location (restaurants, gyms, agencies, etc.) and extracts 50+ data points in real-time.

Key capabilities include:
- **16x more generous free tier** than Apify — 200 searches/month (~20,000+ free leads every month)
- **50+ data points** extracted in real-time
- **Enrichment** — emails, social profiles, decision-maker contacts
- **Reviews extraction** that actually works
- **Built-in API** for Python/Node.js integration
- **Server deployment** on AWS/GCP VMs

## Repository
- **Source:** `C:\Users\ratik\Documents\GitHub\google-maps-scraper`
- **Original upstream:** `omkarcloud/google-maps-scraper`
- **Your fork:** `happyhunterdigital/google-maps-scraper`

## Data Fields

Each business record includes these fields (see `fields.md` for full details):

### Core Identifiers & Info
- **KGMID** — Knowledge Graph Machine ID, unique identifier for each business (use this instead of `place_id` which may be null)
- PLACE_ID, CID, DATA_ID
- NAME, DESCRIPTION, LINK
- MAIN_CATEGORY, CATEGORIES

### Contact & Business Info
- WEBSITE, PHONE, PHONE_INTERNATIONAL
- ADDRESS, DETAILED_ADDRESS, COORDINATES, PLUS_CODE, TIME_ZONE

### Ratings & Reviews
- RATING, REVIEWS, REVIEWS_PER_RATING, REVIEWS_LINK
- REVIEW_KEYWORDS, FEATURED_REVIEWS, FEATURED_QUESTION

### Social Media
- LINKEDIN, TWITTER, FACEBOOK, YOUTUBE, INSTAGRAM
- PINTEREST, GITHUB, SNAPCHAT, TIKTOK

### Business Hours & Services
- WORKDAY_TIMING, CLOSED_ON, HOURS, POPULAR_TIMES, MOST_POPULAR_TIMES
- MENU, RESERVATIONS, ORDER_ONLINE_LINKS, PRICE_RANGE

### Rental Fields (when applicable)
- IS_RENTAL, HOTEL_STARS, PRICE, SLEEPS, BEDROOMS, BEDS, BATHROOMS, MIN_NIGHTS, AMENITIES, CHECKIN_DATE, CHECKOUT_DATE, BOOKING_PLATFORMS

## Usage Scenarios

### 1. Desktop App Usage
- **System requirements:** Google Chrome, stable internet connection
- **Free tier:** 200 searches/month
- **Paid tiers:** Starter ($16/month, 5,000 searches), Unlimited ($48/month, unlimited searches)
- **Download:** Available for Mac, Windows, Ubuntu/Debian, Fedora/CentOS/Red Hat

### 2. Desktop App Commands

**Run on Ubuntu 24.04+ from terminal:**
```bash
googlemapsextractor --no-sandbox
```

**Search strategies:**
- **Fast (Default):** 120–1,600 results per city, completes in 1–10 minutes. Best for country-level extraction.
- **Fastest:** Slightly faster (~30 seconds), ~30-40 fewer results. Speed priority.
- **Detailed:** More results than Fast, takes longer. Best for single-city extraction. Use Max Results = 1000 for large cities.
- **By Zoom Level:** 
  - Zoom 15: Neighborhood Level
  - Zoom 16: Sub-Neighborhood Level
  - Zoom 17: Block Level (time consuming)
  - Zoom 18: Street Level (very time consuming, highest results)
- **By Geolocation:** Search specific area defined by polygon/coordinates

**Geolocation search:**
1. Visit [geojson.io](https://geojson.io/)
2. Search for your city/neighborhood
3. Draw search area with polygon/circle tool
4. Copy GeoJSON into "Polygons Data" field
5. Press Run

**Stopping a running task:** Click the Abort Icon on the task

### 3. API Usage

The tool has a built-in API accessible via the desktop app or server deployment.

**Get auth token:** Sign up at [omkar.cloud](https://www.omkar.cloud/auth/sign-up), visit [API Key Page](https://www.omkar.cloud/api-key)

**Enrichment setup:**
1. Sign up on Omkar Cloud
2. Get API key from [API Key Page](https://www.omkar.cloud/api-key)
3. Enter API key in the "Enrichment" section of the app
4. Verify phone number at [verify phone page](https://www.omkar.cloud/account/verify-phone)
5. Run — enrichment results appear in "Overview" View

### 4. Server Deployment (AWS EC2)

**1. Reserve Elastic IP:**
   - Go to AWS EC2 > Elastic IPs > Allocate Elastic IP address

**2. Create EC2 Instance:**
   - Name: `gmaps`
   - AMI: `Ubuntu Server 24.04 LTS`
   - Instance type: `t3.medium` (2 vCPU, 4 GB) or larger
   - Enable SSH, HTTP, HTTPS traffic
   - Storage: 80 GiB - Magnetic (cheapest)

**3. Install Desktop App:**
```bash
# Install packages
curl -sL https://raw.githubusercontent.com/omkarcloud/botasaurus/master/vm-scripts/install-bota-desktop.sh | bash

# Install desktop app (replace AUTH_TOKEN with your actual token)
python3 -m bota install-desktop-app --debian-installer-url https://www.omkar.cloud/l/deb --custom-args "--auth-token YOUR_AUTH_TOKEN"
```

**4. To delete (avoid charges):**
- Cancel Spot Request (if using Spot)
- Terminate EC2 Instance
- Release Elastic IP

## Troubleshooting

**macOS Chrome not opening:**
- Close the app or restart your computer

**Result count drops after task completes:**
- This is normal — duplicates are removed at the end (expect 20-40% drop for country-level extraction)

**Result count shows ~80K during progress but drops to 70K after completion:**
- Google lists the same places across multiple cities — duplicates removed at end

**Non-English characters lost on export:**
- Uncheck the "English conversion" checkbox in export settings
- Upload to Google Sheets for proper character rendering

**System goes to sleep during scraping:**
- Set sleep mode to "Never":
  - **Windows:** Settings > System > Power & battery > Screen & Sleep = Never
  - **Mac:** Settings > Lock Screen = Never

## Related Tools

- **TripAdvisor Scraper:** For finding restaurants/hotels with websites + email addresses
- **Botasaurus:** Open-source automation framework (3.7K+ GitHub stars) used to build this tool

## File References

- `README.md` — Main usage guide, quick start, FAQs
- `advanced.md` — Deep-dive FAQs for developers and power users
- `fields.md` — Complete schema of all extracted data fields
- `server-deployment.md` — AWS EC2 deployment guide
- `video-script.md` — Video content for tutorials

## Skill Usage

When this skill is invoked, I can:
1. Help you **set up and configure** the scraper locally or on a server
2. **Explain search strategies** and recommend the best approach for your needs
3. **Troubleshoot issues** with the desktop app or API
4. **Deploy on AWS/GCP** VMs for server-side scraping
5. **Interpret data fields** and optimize extraction for maximum results
6. **Set up enrichment** for emails, social profiles, and decision-maker contacts
# Advanced Guide — Running the Audit, Finding Your Listing, Troubleshooting

Plain-English answers for getting a clean, accurate audit of your own business.

---

## Running an audit, step by step

1. **Search for yourself.** Type your official business name plus your city, e.g. `Happy Hunter Digital in Pretoria`.
2. **Wait for the run.** A single search takes seconds to a few minutes.
3. **Find your record.** If other businesses appear in the results, match your listing by exact `NAME` and `ADDRESS` (see "Finding your listing" below).
4. **Export.** CSV, JSON, or Excel.
5. **Read the three groups.** Check Business identity, Core contact points, and Ratings — the groups in `fields.md`.

One audit of one listing = one search. The free plan covers you for years.

---

## Finding your listing (the one tricky step)

Because a search like `restaurants in Johannesburg` returns many businesses, an audit search should target you specifically. Three ways to make sure you find the right record:

1. **Use your exact official name** in the search, e.g. `thabo's bakery in cape town` instead of just `bakery in cape town`.
2. **Match on `NAME` + `ADDRESS`.** Your record is the one whose name and street address match your registered details exactly. Do not trust the first row.
3. **Switch to the Detailed strategy.** It returns the most thorough results for a single city, so your listing is more likely to appear with full address data. Set Max Results to 1000 if your city is large.

Still not there? Widen slightly — search your name alone, or your name plus your street. The listing you are looking for is the one whose fields match your official documents.

---

## Service-area businesses: auditing your boundary

If you have no physical street address because you serve customers across an area (plumbers, electricians, consultants), the audit uses your **designated service-area boundary** instead of a street address.

```
1. Open geojson.io in your browser.
2. Find your area on the map.
3. Draw the boundary with the polygon or circle tool. Press Enter to save a shape.
4. Copy the GeoJSON.
5. Paste it into the "Polygons Data" field in the app.
6. Press Search. The tool records the boundary exactly as drawn.
```

Check that the drawn boundary matches the area you officially serve. If it is too small or too large, re-draw it — customers outside the boundary will not be served, and Google will not recommend you there.

---

## Reading the audit: what is a red flag?

Run the record against these checks:

| Audit group | Check | Red flag |
| --- | --- | --- |
| **Identity** | `NAME` matches your registered name | Misspelling, extra words, or a different legal name |
| **Identity** | `MAIN_CATEGORY` is your real trade | Wrong or generic category ("Other") |
| **Identity** | `ADDRESS` or service-area boundary is correct | Old address, wrong street, boundary too small |
| **Contact** | `PHONE` present and click-to-call | Missing, or an old number |
| **Contact** | `WEBSITE` present and correct | Missing, or pointing at a dead link |
| **Ratings** | `RATING` and `REVIEWS` exist | No reviews, or a very low rating |
| **Ownership** | `CAN_CLAIM` is false | If true, the listing is unclaimed — nobody controls it |

Any red flag is a fixable gap. Claim the listing, correct the details, and grow reviews. That is the entire audit payoff: knowing exactly what to fix.

---

## How to stop a running search

Click the **Abort icon** on the task. Aborting an "All" task also aborts its child tasks. If you close the app while a child task is in progress, that task restarts from zero next time.

---

## Search strategies (still relevant)

The strategies matter less for auditing one business, but they are there when you need them:

| Strategy | Results per city | Time | Best for |
| --- | --- | --- | --- |
| **Fast** (default) | 120–1,600 | 1–10 minutes | Quick audit, normal use |
| **Fastest** | ~30–40 fewer than Fast | ~30 seconds | Speed above all |
| **Detailed** | More than Fast | Significantly longer | Making sure your listing appears with full address data |
| **By Zoom Level** | Depends on zoom (15–18) | 3–4 hours at zoom 18 | Checking a dense area thoroughly |
| **By Geolocation** | Only inside your drawn area | Varies | Service-area boundary audits |

- **Fast (default)** — start here. Good coverage, good speed.
- **Detailed** — when you want to be certain your listing is found, or you audit a whole city of clients.
- **By Zoom Level** — zoom 15 = neighbourhood, 16 = sub-neighbourhood, 17 = block, 18 = street. Only needed if your listing is not showing up in normal searches.
- **By Geolocation** — for service-area boundary checks (see above).

---

## Enrichment — optional, for deeper audits

The core audit needs no enrichment. But if you want more, enrichment adds to the record:

- **Emails** — the best outreach address, with deliverability verification.
- **Social profiles** — LinkedIn, Twitter, and more.
- **Decision makers** — who to actually talk to (CEO, founder, etc.).
- **Phone carrier info** — mobile vs landline.
- **Place sales summary** — a short briefing on the business.

### How to enable enrichment

```
1. Sign up at omkar.cloud (free account).
2. Open the API Key page and copy your key.
3. Paste the key into the "Enrichment" section of the app.
4. Verify your phone number on the account page.
5. Press Search. Results appear in the "Overview" tab.
```

Each month you get **100 free enrichment credits**. No credit card required.

---

## Usage limits

- **Free:** 200 searches/month. Auditing your own business rarely needs more.
- **Starter ($16/month):** 5,000 searches/month — auditing clients at scale.
- **Unlimited ($48/month):** unlimited searches.

Enrichment credits are separate from search credits. Support is included on every plan.

---

## Refunds

Two clicks, no questions asked, within the guarantee window:

1. Open the Transactions page.
2. Click **Request Refund**, then confirm.
3. The refund lands in 1–2 business days.

---

## Troubleshooting

### Chrome won't open on macOS

This is a known macOS issue. Close the app, or restart your computer. Then Chrome launches normally.

### The result count drops when the search finishes

Expected. The tool removes duplicates at the end (Google lists the same place across multiple cities). Your listing is still there — duplicates were copies of the same record.

### Non-English characters are lost in export

1. Uncheck the "English conversion" box in export settings.
2. If Excel still renders them poorly, open the file in Google Sheets instead.

### The system falls asleep mid-audit

Set sleep mode to "Never" — Windows: Settings > System > Power & battery > Screen & Sleep. Mac: Settings > Lock Screen.

### The search does not find my business at all

Possible causes, in order of likelihood:

1. **The listing may not exist.** Search Google Maps in a browser to confirm you have a listing at all. No listing = no record — and that is the audit finding.
2. **The name is stored differently.** Try a broader search (category + city) and look for the closest match.
3. **It is an unclaimed or sparse listing.** `CAN_CLAIM` tells you if it is unclaimed; sparse listings still appear but with fewer fields.
4. **Check the address.** If your listing uses an old or different address, search for that instead.

---

## How the tool is built

The auditor runs on **Botasaurus Desktop**, an open-source scraping framework (3.7K+ GitHub stars) that handles the heavy lifting:

- Building a desktop app for Windows, Mac, and Linux
- A task-management dashboard
- Sorting, filtering, and exporting (CSV, JSON, Excel)
- Caching, parallel, and asynchronous scraping

Happy Hunter Digital maintains the fork used by this skill.

---

## Related tools

- **Happy Hunter Digital suite** — the other tools in this repo (CRM, WhatsApp, Instagram automation, video production) plug into the same pipeline: audit the listing, fix the gaps, measure the results.
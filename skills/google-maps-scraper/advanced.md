# Advanced Guide — Search Strategies, Filters, and Troubleshooting

Plain-English answers to the questions that matter once you start scraping in earnest.

---

## Search strategies: which one should I use?

There are five ways to search. They trade speed against how many businesses you get back.

| Strategy | Results per city | Time | Best for |
| --- | --- | --- | --- |
| **Fast** (default) | 120–1,600 | 1–10 minutes | Country-level extraction |
| **Fastest** | ~30–40 fewer than Fast | ~30 seconds | Speed above all, small loss acceptable |
| **Detailed** | More than Fast | Significantly longer | A single city or state, thoroughness matters |
| **By Zoom Level** | Depends on zoom (15–18) | 3–4 hours at zoom 18 | Absolute highest result count |
| **By Geolocation** | Only inside your drawn area | Varies | A specific neighbourhood or exact boundary |

### Fast (default) — start here

The sensible default. Good coverage, good speed, and if you are extracting an entire country this completes in 1–2 days. Use this unless you have a reason not to.

### Detailed — for one city done properly

Returns more results but takes far longer. Best when you want every single business in one city. **Tip:** set Max Results to 1000 per city, or a big city like New York can take two hours or more.

### By Zoom Level — maximum results

Zoom is how far Google "zooms" the map in, which changes how many businesses each search sees:

- **Zoom 15:** neighbourhood level
- **Zoom 16:** sub-neighbourhood level
- **Zoom 17:** block level (time-consuming)
- **Zoom 18:** street level (very time-consuming, most results)

Use zoom 18 when you want thousands of results for a big city and are willing to wait 3–4 hours. Do not use it for whole-country extraction — that would take 20–30 days.

### By Geolocation — draw your own area

Search only inside a shape you draw. Useful when you want businesses in a specific neighbourhood and nothing outside it.

```
1. Open geojson.io in your browser.
2. Find your city or area on the map.
3. Draw the boundary with the polygon or circle tool. Press Enter to save a shape.
4. Copy the GeoJSON.
5. Paste it into the "Polygons Data" field in the app.
6. Press Search.
```

---

## How to stop a running search

Click the **Abort icon** on the task. Aborting an "All" task also aborts its child tasks. If you close the app while a child task is in progress, that task restarts from zero next time.

---

## Filters: this is where the tool thinks like a salesperson

While a search runs, or on an existing list, filter until the list is exactly your customer:

- **Doing cold calls?** Filter to businesses **with** phone numbers.
- **Selling websites?** Filter to businesses **without** a website. Every single one is a prospect.
- **Want serious buyers?** Minimum 4 stars and 50+ reviews.

The scraped list becomes your pipeline, not just a spreadsheet.

---

## Extraction tips

### Disable auto-sleep

The tool only runs while the computer is awake. Set sleep to **Never**:

- **Windows:** Settings > System > Power & battery > Screen & Sleep
- **Mac:** Settings > Lock Screen

An easy way to scrape overnight without exposing sensitive data: create a separate user account on your machine, and run the app there. Both macOS and Windows keep apps running in the background when you switch users.

### Keep the internet connection stable

If the connection switches or drops, running tasks fail.

### Run the app with a dedicated machine (optional)

Keep your personal laptop free. A cheap cloud VM runs the scraper day and night — see `server-deployment.md`.

---

## Enrichment — turning leads into contacts

Google Maps does not show emails. **Enrichment** fills that gap and more. It adds to every lead:

- **Emails** — the best address for outreach, with deliverability verification.
- **Social profiles** — LinkedIn, Twitter, and more.
- **Decision makers** — who to actually talk to (CEO, founder, etc.).
- **Phone carrier info** — mobile numbers reach owners, landlines reach receptionists.
- **Place sales summary** — a short briefing to personalise your pitch.

### How to enable enrichment

```
1. Sign up at omkar.cloud (free account).
2. Open the API Key page and copy your key.
3. Paste the key into the "Enrichment" section of the app.
4. Verify your phone number on the account page (this prevents abuse of free credits).
5. Press Search. Results appear in the "Overview" tab.
```

Each month you get **100 free enrichment credits**. No credit card required.

---

## Usage limits

- **Free:** 200 searches/month. This is 4x the free allowance of most alternatives.
- **Starter ($16/month):** 5,000 searches/month.
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

Expected. The tool removes duplicates at the end (Google lists the same place across multiple cities). Expect a 20–40% drop on country-level extraction — the duplicates were never unique leads.

### Non-English characters are lost in export

The app converts names to English for Excel compatibility. If you want the original characters:

1. Uncheck the "English conversion" box in export settings.
2. If Excel still renders them poorly, open the file in Google Sheets instead.

### The system falls asleep mid-scrape

Set sleep mode to "Never" (see Extraction tips above).

---

## Country-level extraction: the honest expectations

Pulling every business of a type in a whole country (for example, all restaurants in the US, ~29,500 cities) takes 2–3 days with the Fast strategy. It works, but plan around the time — and understand final numbers will be lower than mid-run because duplicates get removed.

If you need a full-country list faster, Happy Hunter Digital can run the extraction for you (custom data work) — contact us with what you sell and who you are looking for, and we'll scope the job.

---

## How the tool is built

The extractor runs on **Botasaurus Desktop**, an open-source scraping framework (3.7K+ GitHub stars) that handles the heavy lifting:

- Building a desktop app for Windows, Mac, and Linux
- A task-management dashboard
- Sorting, filtering, and exporting (CSV, JSON, Excel)
- Caching, parallel, and asynchronous scraping

Happy Hunter Digital maintains the fork used by this skill.

---

## Related tools

- **TripAdvisor Scraper** — best when your target is restaurants or hotels; it returns website and email in the base extract.
- **Happy Hunter Digital suite** — the other tools in this repo (CRM, WhatsApp, Instagram automation, video production) plug into the same lead pipeline.
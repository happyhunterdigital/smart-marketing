---
name: content-engine
description: Deploy, configure, run, or troubleshoot the Happy Hunter Content Engine — the DeepSeek-powered Facebook/Instagram/LinkedIn/X publisher and 1080×1080 HTML carousel renderer. Use when the user mentions content-engine, daily_post, publish_schedule, Facebook Page publishing, carousel slides, happy_hunter_schedule.json, wellth/Ludo schedules, Pollinations images, or wiring content-engine into smart-marketing.
---

# Content Engine — DeepSeek + Facebook Graph + Playwright Slides

**Source of truth (local clone):** `C:\Users\ratik\Documents\GitHub\content-engine` (`https://github.com/happyhunterdigital/content-engine`)  
**OpenMontage-aware:** `AGENTS.md` routes video requests to `C:\Users\ratik\Documents\GitHub\OpenMontage` (`AGENT_GUIDE.md`). This skill is the **smart-marketing integration point**.

## What it does

| Script | Purpose |
|---|---|
| `scripts/daily_post.py` | Generate one branded post via **DeepSeek `deepseek-chat`** (`research_trending_angle` → `generate_brand_content` → optional `build_image_prompt` → `image.pollinations.ai` free image) and publish to **Facebook Graph `/{page_id}/feed` or `/{page_id}/photos`** |
| `scripts/publish_schedule.py` | Publish **scheduled** posts from `data/*.json` (3 brands: `happy_hunter_schedule.json`, `wellth_schedule.json`, `ludo_league_schedule.json`). Supports **post / carousel / video/reel** + Playwright 1080×1080 HTML carousel (`render_html_carousel_slides`) + lead-magnet CTA injection (`[FREE_PDF_LINK]` → audit URL) |

**Data format** (`data/happy_hunter_schedule.json` as example, 41+ entries, SAST dates):
```json
{ "brand": "Happy Hunter Digital", "focus": "GEO, AI Search Visibility, …", "schedule": [{ "date":"2026-08-10", "slot":"07:30", "platform":"LinkedIn", "pillar":"AWARENESS", "format":"post|carousel|video", "headline":"…", "body":"SLIDE 1: …\nCaption: [FREE_PDF_CAPTION]", "hashtags":["#GEO"] }] }
```
**Platforms:** `Facebook`, `LinkedIn`, `X`, `Instagram`, `TikTok`. **Pillars:** `AWARENESS`/`ACTIONABLE`/`PROOF`/`CONVERSION`.

### Carousel rendering (Option 1 HTML)

`publish_schedule.py:50 render_html_carousel_slides` splits `SLIDE 1:` markers, renders each as 1080×1080 Playwright Chromium page with Inter + Happy Hunter brand (logo `res.cloudinary.com/dkyg07qvv/.../happyhunterdigital_logo_l61qn8.jpg`, amber `#EAB308` on `#050505`, grid overlay), screenshots to `output_slides/slide_{idx}.png`. Carousel publish: upload each as unpublished `/{page_id}/photos` → collect `media_fbid` → publish `/{page_id}/feed` with `attached_media[{idx}]`.

### Video / Reel handoff

`resolve_video_path()` checks `post['video_path']` → `assets/videos/the-invisibility-tax.mp4` / `q3-output.mp4` → `../OpenMontage/projects/q3-animated-explainer/renders|exports/video/output.mp4`. Facebook Page video: `POST /{page_id}/videos` with `source` + `description`. Instagram/TikTok: logs handoff (needs `IG_USER_ID` + `instagram_content_publish` for auto-Reel).

### Lead-magnet CTA

`CAROUSEL_CTAS` maps platform → audit CTA (`happyhunterdigital.com/audit` or `link in bio`). `apply_lead_magnet()` replaces `[FREE_PDF_LINK]`/`[FREE_PDF_CAPTION]`.

## Env vars

```
DEEPSEEK_API_KEY                              # required for both scripts (OpenAI client base_url https://api.deepseek.com)
# daily_post.py — per-brand (args --page_id_env / --token_env)
FB_PAGE_ID_HAPPYHUNTER / FB_TOKEN_HAPPYHUNTER # also FB_PAGE_ID_LUDOLEAGUE, FB_PAGE_ID_IWS variants
FB_PAGE_ID_WELLTH / FB_TOKEN_WELLTH etc.      # any brand — env name passed via CLI
# publish_schedule.py — reads same FB_* envs directly (no args), plus optional:
#   IG_USER_ID + FB_TOKEN with instagram_content_publish  # for auto Instagram Reel
```

## Quick start

```powershell
# One-off AI post (DeepSeek → FB)
cd C:\Users\ratik\Documents\GitHub\content-engine
$env:DEEPSEEK_API_KEY="…"; $env:FB_PAGE_ID_HAPPYHUNTER="…"; $env:FB_TOKEN_HAPPYHUNTER="…"
python scripts/daily_post.py --brand "Happy Hunter Digital" --page_id_env FB_PAGE_ID_HAPPYHUNTER --token_env FB_TOKEN_HAPPYHUNTER --focus "GEO, AI Search Visibility" --format post --with_image

# Scheduled publish (today SAST, all brands/slots)
python scripts/publish_schedule.py --dry-run                          # renders slides to output_slides/, logs without posting
python scripts/publish_schedule.py --brand "Happy Hunter" --slot morning --dry-run
python scripts/publish_schedule.py                                    # live post to Graph API
python scripts/publish_schedule.py --date 2026-08-16 --slot evening
```

Dry-run is safe — no Graph calls, only local PNGs.

## Wiring into smart-marketing

- **Dashboard card:** add `apps/web/pages/dashboard/index.tsx` card linking to `/dashboard/content` (schedule preview, dry-run trigger via Cloud Function or local script).
- **Functions proxy (optional):** wrap `publish_schedule.py` as an `onSchedule` Cloud Function (`every day 08:00 SAST`) + `onCall` for manual trigger. Requires `DEEPSEEK_API_KEY`, `FB_*` as Firebase secrets and Playwright deps (use Cloud Run if Chromium needed).
- **Keep in sync:** when `happy_hunter_schedule.json` dates shift, update `publish_schedule.py --date`. Video handoff: copy `OpenMontage/projects/<project>/renders/*.mp4` → `content-engine/assets/videos/`.

## Troubleshooting

- `Missing DEEPSEEK_API_KEY` → set env, retry.
- `No Facebook credentials` → script logs post but skips upload — check `FB_PAGE_ID_*` / `FB_TOKEN_*`.
- `No video file found` → copy finished mp4 from OpenMontage handoff dir; set `post["video_path"]`.
- Carousel fallback: if photo upload fails, posts text-only to `/{page_id}/feed`.
- SAST handling: `SAST = UTC+2`; `--date` defaults to `now(SAST)`.

## Pointers

- Schedules: `data/happy_hunter_schedule.json:1`, `data/wellth_schedule.json`, `data/ludo_league_schedule.json`
- Scripts: `scripts/daily_post.py:47`, `scripts/publish_schedule.py:50`
- OpenMontage handoff: `assets/videos/` ↔ `../OpenMontage/projects/`

---
name: social-analyzer
description: Deploy, configure, run, or troubleshoot Social Analyzer (qeeqbox/social-analyzer), the fork at happyhunterdigital/social-analyzer. Use when the user mentions the Social Analyzer repo, OSINT username/profile searching across social networks, the `app.js` CLI/GUI, the `fast-scan`/`slow-scan`/`special-scan` modules, or when wiring Social Analyzer into another happyhunterdigital project (e.g. the CRM/agent).
---

# Social Analyzer (qeeqbox fork) — OSINT profile finder

Fork of `qeeqbox/social-analyzer` (AGPL-3.0). Local clone: `C:\Users\ratik\Documents\GitHub\social-analyzer`.
What it is: an OSINT tool that checks a username/brand against **1000+ sites** (social networks included) and tells you whether the string exists as a profile, choosing from modes `fast` / `slow` / `special`, plus an optional web UI (`--gui`).

## Modes

- `fast` (default): `FindUserProfilesFast` — quick HTTP lookups via a local "sites.json" database.
- `slow`: `FindUserProfilesSlow` / `ShowUserProfilesSlow` — advanced mode (selenium-based) with full page fetch + data extraction.
- `special`: `FindUserProfilesSpecial` — targeted checks like Facebook (phone/name/profile), Gmail address existence, Google searches.

Outputs JSON when `--output json`, or pretty when not. Examples:

```sh
node app.js --username "johndoe"
node app.js --username "johndoe" --mode fast --output json --websites "youtube tiktok"
node app.js --username "janedoe" --mode slow --output json --websites "instagram"
# GUI (web console):
node app.js --gui        # http://localhost:9005/app.html (PORT env to change)
```

## Repo layout (fork state)

- `app.js` — entrypoint; defines yargs CLI, Express app, and the analysis routes.
- `modules/` — `helper.js` (shared details), `fast-scan.js`, `slow-scan.js`, `special-scan.js`, `external-apis.js`, `string-analysis.js`, `name-analysis.js`, `engine.js`, `stats.js`, `visualize.js`.
- `data/sites.json` — the lookup catalog (URLs, detection rules, countries, ranks).
- `public/` — built UI assets; root URL is `/app.html` -> `http://0.0.0.0:9005/app.html`.
- `logs/` — per-task logs, written via `helper.log_to_file_queue(uuid, message)`.
- `test/` — basic coverage.

## Express endpoints (useful if running the GUI/API)

- `POST /analyze_string` — the main analysis route. Body: `string` (username, comma-separated groups OK), `option` (`FindUserProfilesFast`, `FindUserProfilesSlow`, `FindUserProfilesSpecial`...), `uuid` (client tracking id), `websites` (space separated site keys), `top` (rank limit), `countries` (space-separated ISO codes / `all`), `type`, `method` (`find`/`get`/`all`), `filter` (`good,maybe,bad`), `profiles` (`detected,unknown,failed`), `graph`, `metadata`, `extract`, `trim`, and extra `buttons` like `customSearch` / `findOrigins` / `mostCommon` / `networkGraph`. Response: JSON with `detected`, `unknown`, `failed` arrays and metadata (name origins, common words, network graph, ages, etc.).
- `POST /get_logs` — expects `{uuid}`; returns the last line of the per-task log.
- `GET /get_settings` — website list + current defaults (proxy, user-agent, Google keys).
- `POST /save_settings` — update settings at runtime (proxy, user-agent, Google key).
- `POST /generate` — username permutation generator.
- `POST /cancel` — aborts a running task by uuid.
- Root `/` redirects to the UI.

## Internals worth knowing

- `server_port` default `9005` (env `PORT`). Set `--docker` to listen on `0.0.0.0` (container-friendly); default host is `localhost`.
- Persistent queues are file-based: each task writes log lines to `./logs/<uuid>.log`; cancel uses a global `global_lock` list.
- `sleep_time` and per-site methodology are in `modules/helper.js` (handles rate limiting, user agent, proxy).
- `data/sites.json_new` suggests the site's catalog gets rotated; the repo ships with copy `sites.json` (used at runtime).
- Slow mode uses Selenium/geckodriver (requires `geckodriver` + Firefox or Chrome when noted; check repo docs for local prerequisites).
- Clean-up tasks/styles/scripts are inside the project root folders; run `clean-up.logs` only inside the repo.

## Common calls

- Fast scan + JSON: `node app.js --username "janedoe" --output json --websites "youtube tiktok"`
- Full UI + APIs: `node app.js --gui`
- Special (Facebook/Gmail/Google): `node app.js --username "janedoe@gmail.com" --mode special`

## Wiring to other happyhunterdigital repos

- **CRM enrichment**: the CRM agent can call Social Analyzer's HTTP `POST /analyze_string` (no auth) as another data source — e.g. when enriching a contact/company, hit `fast` first, then `slow` if names don't surface. Remember: **no auth is bound to these routes** in the current build, so keep any deployments off the public internet or front them with your own auth (the bot's existing `x-crm-bot-secret` style checks are the model to copy).
- **Agent-side browsing**: if you want the agent to browse results, set `--metadata` and/or `--extract` to populate returned links for downstream scraping or citation gathering.
- **Logging/troubleshooting**: check per-uuid log files via `POST /get_logs` (or read from `logs/`); slow-mode issues usually mean a missing browser driver.

## Quick start (full clone + run)

```bash
git clone https://github.com/happyhunterdigital/social-analyzer.git
cd social-analyzer
npm install       # depends on node-gyp for selenium/etc.
node app.js --gui # web console at http://localhost:9005/app.html
```

## When connecting

- Expect high false-positive noise on fast-scan; confirm anything important by following through or using slow/special modes.
- No license leak: the project is AGPL — keep any derivatives public and credit QeeqBox/root author.
- For reliable results always pass `--websites` for the ones you actually care about — `all` runs through thousands of sites and can take minutes.

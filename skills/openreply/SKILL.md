---
name: openreply
description: Deploy, configure, run, or troubleshoot OpenReply — the open-source Instagram comment-to-DM automation tool (self-hosted ManyChat alternative). Use when the user mentions OpenReply, comment-to-DM, Instagram comment automation, keyword-to-DM campaigns, "LINK" comment automation, Instagram webhooks, private replies, follow-gates, tracked link buttons, or the repo diwenne/openreply. Also use when applying OpenReply to one of the happyhunterdigital repos.
---

# OpenReply — Instagram Comment-to-DM Automation

OpenReply is an MIT-licensed, self-hosted ManyChat alternative. Someone comments a keyword
(e.g. `LINK`) on an Instagram post/reel, and OpenReply DMs them a link through Meta's
official API a second later, with optional public comment reply, tracked links, follow-gating,
and keyword-triggered DM auto-replies. It scrapes nothing, uses no browser automation, and
never asks for an Instagram password.

Local clone (reference source of truth): `C:\Users\ratik\Documents\GitHub\openreply`
Full guides live in that repo: `docs/setup.md` (step-by-step) and `docs/stack.md` (stack).
Always read those files first before doing setup work.

## Architecture

Two processes, two datastores — the web app and the worker MUST share the same
`DATABASE_URL`, `REDIS_URL`, and `ENCRYPTION_KEY`.

- **Web app + API** (`npm run dev` / `npm start`): Next.js 16 (App Router, Turbopack) + React 19 + TS 5.
  Serves the dashboard, the Instagram OAuth callback, and the incoming webhook. Serverless-friendly → Vercel.
- **Worker** (`npm run worker`, via `tsx worker/dm-worker.ts`): long-running Node process that
  consumes the BullMQ queue, sends DMs, runs the polling reconciler, and does follow-gate checks.
  MUST stay always-on → cannot run on Vercel (free-tier). Runs on Railway / Render / Fly / Oracle "Always Free" VM.
- **PostgreSQL**: campaigns (Automation), DM logs, accounts, sessions, tracked links, click events.
- **Redis**: BullMQ send queue + per-account rate limiter. Must speak native Redis over TCP (HTTP-only Redis won't work with BullMQ).

Queue flow: Meta webhook → `app/api/webhook/route.ts` → BullMQ queue (`process-comment`,
`process-postback`, `process-message`, `process-followup`) → `lib/queue/dm-worker.ts` sends via
`lib/meta/client.ts`. The worker also runs `lib/polling/comment-reconciler.ts` as a safety net
for webhooks that Meta misses.

## Env vars (see `.env.example` and setup.md table)

Required: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CRON_SECRET`, `ENCRYPTION_KEY` (32-byte hex,
identical on web + worker), `DATABASE_URL`, `REDIS_URL`, `RESEND_API_KEY`, `EMAIL_FROM`
(verified Resend sender domain), `META_GRAPH_API_VERSION`, `INSTAGRAM_APP_ID`,
`INSTAGRAM_APP_SECRET`, `FACEBOOK_APP_SECRET`, `WEBHOOK_VERIFY_TOKEN`.

Optional tuning: `COMMENT_POLL_INTERVAL_MS` (default 300000), `COMMENT_POLL_MAX_PER_SWEEP` (30),
`COMMENT_POLL_LOOKBACK_HOURS` (72).

## Local dev

```bash
git clone https://github.com/diwenne/openreply.git
cd openreply
npm install
cp .env.example .env        # fill values; see docs/setup.md
docker-compose up -d        # Postgres:5432 + Redis:6379
npm run db:migrate
npm run dev                 # terminal 1 — web app :3000 + webhook receiver
npm run worker              # terminal 2 — actually sends DMs
# For Meta to reach local webhook: ngrok http 3000, point NEXTAUTH_URL + Meta webhook/redirect at the tunnel
```

Two processes, always. If comments arrive but no DM sends, check the worker first.

## Meta setup (the slow part — do in this order)

1. **Create app** at developers.facebook.com/apps — type **Business**. Choose use case
   "Manage messaging and content on Instagram" (NOT Facebook Login, NOT Marketing API).
2. **Collect secrets**: `INSTAGRAM_APP_ID`/`INSTAGRAM_APP_SECRET` under the Instagram product;
   `FACEBOOK_APP_SECRET` under App settings → Basic. Instagram App ID ≠ Facebook App ID.
3. **Add Instagram tester + accept the invite** — both halves. Meta side: App roles → Instagram
   testers, add the exact username. Instagram side: profile → Settings → Apps and websites →
   Tester invites → Accept. Missing this yields "Insufficient Developer Role".
4. **OAuth redirect**: Instagram product → Business login settings. Add exactly
   `https://your-app.vercel.app/api/instagram/callback` (no trailing slash).
5. **Webhook**: callback `https://your-app.vercel.app/api/webhook`, verify token =
   `WEBHOOK_VERIFY_TOKEN`, subscribe to the `comments` field. Test button → then "Send to My Server"
   (two-step). A non-primary domain 307-redirects and Meta silently stops.
6. **Publish the app** (left sidebar → Publish). Real webhooks only arrive in Live state.
   Set privacy/terms/data-deletion URLs first — the repo ships `/privacy`, `/terms`, `/data-deletion`.
7. Accounts must be Business or Creator (not personal). Login is email magic links via Resend only.

Trap: Meta `/me` returns `id` (app-scoped) and `user_id` (professional account ID). OpenReply
stores `user_id`. Don't "fix" this. If an old account mismatches, disconnect + reconnect once.

## Hosted deployment (recommended)

- **Railway first** (Postgres + Redis + worker): worker Build Command `npm run db:generate`,
  Start Command `npm run worker`. Use internal `*.railway.internal` URLs for the worker.
  Do NOT leave build as default `npm run build` (it runs `next build` and hits DB at build time).
- **Migrate once** from your machine with the public Postgres URL:
  `DATABASE_URL="postgresql://...proxy.rlwy.net.../railway" npm run db:migrate`
- **Vercel** (web app): use the public `DATABASE_PUBLIC_URL` / `REDIS_PUBLIC_URL` (internal URLs
  hang/timeout from Vercel). `NEXTAUTH_URL` = your Vercel domain. Build runs `prisma generate`.
  Crons (token refresh) are in `vercel.json`; free plan = at most once/day, which is fine.

## Diagnosing failures (faster than logs — query Postgres directly)

- `WebhookEvent` — was the comment delivered? (status PENDING/PROCESSED/FAILED)
- `DmLog` — send status/errors per campaign+comment (SENT / FAILED / SKIPPED_*)
- `OperationalEvent` — worker crashes and reconciler sweeps
- `/api/health` — reports DB, Redis, queue, worker heartbeat. If `worker.healthy` is false the
  worker is down and nothing sends even though webhooks arrive.

## Key behaviors (from the worker code)

- Meta allows exactly **one private reply per comment ever** — overlapping campaigns are deduped
  (SKIPPED_DEDUP). Public comment replies still fire per campaign.
- Rate limiting: stays under Meta's 750 private replies/hour; queues overflow (SKIPPED_RATE_LIMIT)
  or requeues with backoff [5m, 15m, 45m].
- Button templates capped at 3 buttons, text 640 chars, titles 20 chars; falls back to inline
  links when Meta rejects a template.
- Follow gate: `followcheck:<id>` and `reveal:<id>` postback payloads; fails open on unverifiable
  follow status after a tap; `{username}` is personalized from captured commenter name.
- Workspace roles: OWNER/ADMIN/MEMBER with invite links. Monthly DM cap via `lib/billing/usage.ts`.
- Self-comments never trigger (Meta rejects DMing yourself anyway).
- To onboard a stranger: Meta App Review needed (Advanced Access, screencast, justification drafts
  in `META_APP_REVIEW.md`, business verification). Own-account self-hosting never needs review.

## Security

- `.env` is gitignored; never commit secrets.
- Rotate any secret pasted to an assistant/chat.
- Instagram tokens are AES-256-GCM encrypted with `ENCRYPTION_KEY`; changing/losing it forces every
  account to reconnect.

## Applying to a happyhunterdigital repo

When deploying for one of the user's repos/accounts: identify the Instagram Business/Creator
account to connect, stand up the datastores + worker + web app per the hosted flow above, point
Meta at that instance's domain, create a keyword campaign (e.g. `LINK`) on the relevant post or
"match any post", and verify end-to-end with a comment from a second account checking `DmLog` + `/api/health`.

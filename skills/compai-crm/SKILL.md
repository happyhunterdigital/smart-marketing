---
name: compai-crm
description: Work on Comp AI CRM (trycompai/crm) — an open-source, agentic-first CRM designed for AI agents. Use when the user mentions the CRM repo, the eve agent, contact/company/deal records, Agent tabs, mailbox sync, evidence-ledger facts, agent tools/skills/schedules, better-auth sign-in, or applying it to a happyhunterdigital repo.
---

# Comp AI CRM — agentic-first CRM (trycompai/crm)

MIT-licensed, open-source CRM where **the agent is not a feature of the CRM — the CRM is where
the agent keeps its notes**. The agent runs its own deployment, on its own schedule, against its
own work queue, and stops when its research budget runs out.

Local clone (source of truth): `C:\Users\ratik\Documents\GitHub\crm` (default branch `release` is
the last tagged release; `main` is unreleased work). Read `AGENTS.md` first — it indexes which doc
to read before touching any area, and every repo rule is in there.

## Monorepo layout (Turborepo + Bun, deployed on Vercel)

| Path | What | Port |
| --- | --- | --- |
| `apps/agent` | The research agent — **eve** app (tools, skills, schedules, sandbox, subagents) | 2000 |
| `apps/app` | Next.js 16 front end, App Router, shadcn/ui, nuqs (URL state), tanstack-query | 3000 |
| `apps/api` | NestJS 11 + `nestjs-trpc` — HTTP, auth, tRPC, mailbox sync | 3001 |
| `packages/db` | Prisma schema, migrations, shared Postgres client (`@crm/db`) | |
| `packages/auth` | Better Auth config + the sign-in allow-list (`@crm/auth`) | |
| `packages/ui` | shadcn/ui components + the Tailwind theme — **the only source of UI** | |
| `packages/env` | Locates/loads the single root `.env` | |

Tooling: Bun (packageManager `bun@1.3.12`), TypeScript, Biome. `turbo.json` runs everything.

## Three rules the codebase holds to (read AGENTS.md for the full set)

1. **Intelligence never lives in the API.** Nest reports something happened; the agent decides what
   it means. The API may write an `AgentTask` row — no vendor client, no enrichment, no scoring, no
   identity matching in Nest. `docs/api.md` is the contract.
2. **`packages/ui` is the only source of UI.** Shared shadcn components only; new variants are
   implemented there, never overridden at the call site (`docs/design.md`).
3. **There are no organizations.** Single tenant, deliberately — no `organizationId` column.

Also: **never add code comments**; no `Co-Authored-By`; one root `.env` (`.env.example` is its
documentation); anything a self-hoster might not have is optional and must never throw
(`apps/agent/agent/lib/capabilities.ts` is the pattern); eve docs ship in
`apps/agent/node_modules/eve/docs` (read the installed version, don't work from memory).

## The agent (`apps/agent`) — eve

Built on **eve** (Vercel's filesystem-first durable-agents framework): a tool is a file, a skill is
markdown, a schedule is a file, the runtime handles durability.

- **~18 authored tools** in `agent/tools/` (`read_crm_history`, `search_crm`, `identify_contact`,
  `research_person`, `enrich_company`, `record_fact`, `schedule_recheck`, `record_job_change`,
  `write_brief`, `set_field_value`, …).
- **4 skills** in `agent/skills/`: `evidence.md`, `identity-matching.md`, `data-boundaries.md`,
  `writing-a-brief.md` — prose the agent reads.
- **1 schedule** `agent/schedules/dispatch.ts` — decides nothing, just leases due rows and starts a
  session per row. "Every N minutes, the oldest ten contacts" lives in a task's `dueAt`, never in a
  cron. `lib/tasks.ts` `claimDue` leases with `FOR UPDATE SKIP LOCKED` (two dispatchers take
  disjoint work; a dead run frees its row when the lease expires).
- **Two lanes**: visible kinds (`brand`, `portrait`) handled directly with no model; research kinds
  get one eve session each. Dispatch on demand via `POST /internal/crm/dispatch` (poked after any
  AgentTask write; fire-and-forget).
- **Sandbox** `agent/sandbox/sandbox.ts`: `bash`/`grep`/`glob` + `/workspace`, **deny-all egress**.
  Never give the sandbox `DATABASE_URL`.
- **Evidence, not confidence**: no tool accepts a confidence/score. Tools report what they observed
  (`crm.signature-block`, `github.account-identity`) and `lib/evidence.ts` prices it. Strong evidence
  writes at `VERIFIED`; weak becomes `PROBABLE` (a rep decides). `lib/facts.ts` is the only write
  path to a contact's fields: never overwrite a human, never re-offer a dismissal, never write
  without a primary source.
- **Model**: `zai/glm-5.2-fast` default, an `AppSetting` row not an env var; reached through Vercel
  AI Gateway (OIDC on Vercel). Deliberately not frontier — correctness is enforced by tools+evidence.
- **Every read hands back the ids of neighbouring records** (company id, deals, colleagues) — no
  dead ends, `search_crm` does no fuzzy matching.
- Optional data sources (each key unlocks one more place to look): Perplexity
  (`PERPLEXITY_API_KEY`), LinkedIn via RapidAPI (`RAPIDAPI_KEY`), GitHub (`GITHUB_TOKEN`),
  Context brand data (a row in Settings → General, not an env var), Vercel Blob
  (`BLOB_READ_WRITE_TOKEN`). With none set it still works off your own email/calendar history.
- **Team-agent builder/runner**: `agent_builder`/`agent_runner` subagents build and run custom agents
  with typed permissions (record scope, connection grants, action grants, immutable deployed
  versions). Deployment is the human approval boundary.
- Docs: `docs/agent.md` (full write-up), `docs/agent-panel.md` (the Agent tab), `.agents/skills/eve`.

## The API (`apps/api`) — NestJS + tRPC

- Front end talks to the API over **tRPC**; the `AppRouter` type is generated from the NestJS
  routers (`bun run --filter=api trpc:generate`). **`apps/api/src/generated/server.ts` is committed
  and `build` must never regenerate it** (the generator needs a newer GLIBC than most build images).
- **Auth = Better Auth** (Google / Microsoft / your own IdP on Settings → SSO). `ALLOWED_SIGN_IN`
  (email domains and/or single addresses) is the entire authorisation model; unset = nobody can sign
  in. Read-only mailbox sync (Gmail via the Google OAuth client, Outlook via Microsoft Graph) —
  forward-only, never sends/moves/deletes.
- Caching via cache-manager, Redis when `REDIS_URL` set, else per-instance in-memory. Guarded cron
  route `POST /internal/sync/mailboxes` (needs `CRON_SECRET`).
- `docs/api.md` = tRPC/auth/logging/sync/deletes/caching contract; `docs/currency.md` = deal
  amounts/totals/rates; `docs/environment.md` = every env var.

## Quick start

```sh
git clone https://github.com/trycompai/crm.git && cd crm   # branch: release
cp .env.example .env
bun install
docker compose up -d          # Postgres on :5432
bun run db:deploy             # apply migrations
bun run db:seed               # optional believable pipeline
bun run dev
```

App `:3000`, API `:3001`, agent `:2000`. Set `BETTER_AUTH_SECRET`, `ALLOWED_SIGN_IN`, and Google
and/or Microsoft OAuth creds. Google redirect URI: `<API_URL>/api/auth/callback/google`; Microsoft:
`<API_URL>/api/auth/callback/microsoft` (the API's origin, not the app's).

Tasks: `bun run build|test|check-types|lint|format|db:migrate|db:seed|db:studio`, scoped with
`--filter=<app|api|agent>`.

## Deploying

Three independent deployments (Next.js app, NestJS API, agent) + a Postgres. They only must agree
on `DATABASE_URL` and `BETTER_AUTH_SECRET` (the API mints the session cookie, the app verifies it —
a mismatch is a redirect loop). Set `API_URL`/`APP_URL` to real origins; `AUTH_COOKIE_DOMAIN` if
both halves sit on subdomains of one parent. Add the provider redirect URIs for the API host, set
`CRON_SECRET` and schedule `POST /internal/sync/mailboxes`. Regenerate and commit `server.ts` with
any router change.

## Sign-in providers (quick reference)

- **Google**: Cloud console → OAuth client ID → Web application → redirect URI `…/api/auth/callback/google`; enable Gmail + Calendar APIs. Set both ID+secret or neither.
- **Microsoft**: Entra app registration → redirect URI `…/api/auth/callback/microsoft` → delegated Graph perms `User.Read` + `Mail.Read` → client secret (copy the Value). Optional `MICROSOFT_TENANT_ID` (`common` default, `organizations`, or your tenant GUID). Client secrets expire — note the expiry (lapsed secret = mail silently stops syncing).

## Applying to a happyhunterdigital repo

When wiring Comp AI CRM for one of the user's repos/accounts: treat it as a single-tenant CRM +
research agent deployment. Stand up Postgres (docker compose), set the required env
(`BETTER_AUTH_SECRET`, `ALLOWED_SIGN_IN`, at least one OAuth pair, `AGENT_BRIDGE_SECRET` to link
the Agent tab), deploy the three processes (app/api/agent) with matching `DATABASE_URL` +
`BETTER_AUTH_SECRET`, then optionally add Perplexity/LinkedIn/Context keys so the agent can research
contacts. Never put intelligence in the API; add capabilities as agent tools/skills under
`apps/agent/agent/` and read the eve docs first.

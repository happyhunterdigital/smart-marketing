---
name: happyhunter-crm
description: Deploy, configure, run, and develop Happy Hunter CRM (happyhunterdigital/crm) — an open-source, agentic-first CRM designed for autonomous AI agents. Use when the user mentions Happy Hunter CRM, eve research agent, contact/company/deal pipelines, Agent tabs, mailbox sync (Gmail/Outlook), evidence-ledger facts, agent tools/schedules, or Better Auth sign-in.
---

# Happy Hunter CRM — Agentic-First CRM (happyhunterdigital/crm)

Happy Hunter CRM is an MIT-licensed, open-source, agentic-first CRM where **the agent is not a feature of the CRM — the CRM is where the agent keeps its notes**. The autonomous agent runs its own deployment, on its own schedule, against its own work queue, and stops when its research budget runs out.

- **Repository:** [https://github.com/happyhunterdigital/crm](https://github.com/happyhunterdigital/crm)
- **Local Clone / Source of Truth:** `C:\Users\ratik\Documents\GitHub\crm` (default branch: `release`, `main` for unreleased work).
- **Core Guide:** Read `AGENTS.md` first — it indexes which documentation to consult before touching any module.

---

## Monorepo Layout (Turborepo + Bun, deployed on Vercel)

| Path | Description | Port |
| :--- | :--- | :--- |
| `apps/agent` | The autonomous research agent — **eve** app (tools, skills, schedules, sandbox, subagents) | `2000` |
| `apps/app` | Next.js 16 front end, App Router, shadcn/ui, nuqs (URL state), TanStack Query | `3000` |
| `apps/api` | NestJS 11 + `nestjs-trpc` — HTTP, auth, tRPC router, mailbox sync | `3001` |
| `packages/db` | Prisma schema, migrations, shared Postgres client (`@crm/db`) | — |
| `packages/auth` | Better Auth configuration & sign-in allow-list (`@crm/auth`) | — |
| `packages/ui` | shadcn/ui components & Tailwind theme — **the single source of UI** | — |
| `packages/env` | Locates and loads the single root `.env` | — |

Tooling: Bun (`bun@1.3.12`), TypeScript, Biome. `turbo.json` coordinates all pipelines.

---

## Core Codebase Principles

1. **Intelligence never lives in the API**: NestJS reports that something happened; the agent decides what it means. The API may write an `AgentTask` row — no vendor client, no enrichment, no scoring, no identity matching in Nest. `docs/api.md` is the contract.
2. **`packages/ui` is the only source of UI**: Shared shadcn components only; new variants are implemented there, never overridden at the call site (`docs/design.md`).
3. **Single Tenant Architecture**: No `organizationId` column. Dedicated, private instances for maximum data sovereignty and agent autonomy.
4. **Clean Code Protocol**: Never add unneeded code comments; no `Co-Authored-By`; one root `.env` (`.env.example` is documentation); optional external capabilities must degrade gracefully and never throw (`apps/agent/agent/lib/capabilities.ts`).

---

## The Autonomous Agent (`apps/agent`) — Eve

Built on **eve** (Vercel's filesystem-first durable-agents framework): a tool is a file, a skill is markdown, a schedule is a file, and the runtime handles durability.

- **18+ Authored Tools** in `agent/tools/`:
  - `read_crm_history`: Reads threads, meetings, and raw signature blocks.
  - `search_crm`: Exact-match graph search returning neighbouring entity IDs.
  - `identify_contact`: Discovers professional profiles and identity anchors.
  - `research_person`: Autonomous web & dossier research.
  - `enrich_company`: Brand, industry, and firmographic enrichment.
  - `record_fact`: Writes verified facts to the evidence ledger.
  - `schedule_recheck`: Books self-scheduled future research with transparent rationale.
  - `record_job_change`, `write_brief`, `set_field_value`, and more.
- **Skills** in `agent/skills/`:
  - `evidence.md`, `identity-matching.md`, `data-boundaries.md`, `writing-a-brief.md`.
- **Work Queue & Scheduling**:
  - `agent/schedules/dispatch.ts` leases due task rows using `FOR UPDATE SKIP LOCKED`.
  - Tasks carry their own `dueAt`. If an agent wants to revisit a contact in 14 days, it schedules it with an explicit reason shown to the team.
- **Sandbox Security (`agent/sandbox/sandbox.ts`)**:
  - `bash`, `grep`, `glob`, and `/workspace` with **deny-all egress**.
  - The sandbox is **never given `DATABASE_URL`**, preventing any possible credential leak or data exfiltration.
- **Evidence-First Ledger**:
  - No tool accepts arbitrary confidence scores. Tools report what they *observed* (`crm.signature-block`, `github.account-identity`), and `lib/evidence.ts` grades the evidence.
  - Strong evidence writes directly as `VERIFIED`; ambiguous evidence becomes `PROBABLE` for human confirmation.
- **Optional Integrations**:
  - Perplexity (`PERPLEXITY_API_KEY`)
  - LinkedIn via RapidAPI (`RAPIDAPI_KEY`)
  - GitHub (`GITHUB_TOKEN`)
  - Context Brand Data (configured in Settings → General)
  - Vercel Blob (`BLOB_READ_WRITE_TOKEN`)

---

## The API (`apps/api`) — NestJS + tRPC

- Front end communicates with the API over end-to-end type-safe **tRPC**.
- `apps/api/src/generated/server.ts` is committed and never regenerated during standard builds.
- **Authentication**: Better Auth (Google OAuth, Microsoft 365, or custom IdP). `ALLOWED_SIGN_IN` defines the authorized email addresses/domains.
- **Mailbox Sync**: Read-only, forward-only background sync for Gmail and Microsoft Outlook (Graph API).
- **Caching**: Multi-tier cache via cache-manager (in-memory or Redis via `REDIS_URL`).

---

## Quick Start & Local Development

```bash
# Clone the repository
git clone https://github.com/happyhunterdigital/crm.git
cd crm

# Configure environment
cp .env.example .env

# Install dependencies and start Postgres
bun install
docker compose up -d

# Migrate database and seed initial demo data
bun run db:deploy
bun run db:seed

# Start development servers (App :3000, API :3001, Agent :2000)
bun run dev
```

---

## Deploying Happy Hunter CRM

Happy Hunter CRM is structured as three independent deployments + Postgres:
1. **Next.js App (`apps/app`)**: Deploy to Vercel.
2. **NestJS API (`apps/api`)**: Deploy to Vercel or Node container.
3. **Eve Agent (`apps/agent`)**: Deploy to Vercel or durable worker.
4. **Shared Environment**:
   - `DATABASE_URL`: Shared PostgreSQL database connection string.
   - `BETTER_AUTH_SECRET`: Shared secret for token minting and session verification.
   - `AGENT_BRIDGE_SECRET`: Shared secret connecting the front-end Agent tab with the Eve runtime.
   - `API_URL` & `APP_URL`: Public URLs for client routing and OAuth callback resolution.

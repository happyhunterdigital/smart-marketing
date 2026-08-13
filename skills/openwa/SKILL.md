---
name: openwa
description: Deploy, configure, run, or troubleshoot OpenWA — the open-source WhatsApp API gateway (self-hosted unofficial API for WhatsApp). Use when the user mentions OpenWA, WhatsApp automation, sending WhatsApp messages programmatically, WhatsApp QR code login, whatsapp-web.js, Baileys, WhatsApp webhooks, WhatsApp MCP, the repo rmyndharis/OpenWA, or applying OpenWA to one of the happyhunterdigital repos.
---

# OpenWA — WhatsApp API Gateway (self-hosted)

OpenWA is a free, MIT-licensed, self-hosted WhatsApp API gateway: a REST API + web dashboard that
drives real WhatsApp numbers. It is **not** Meta's official WhatsApp Cloud API — it connects through
reverse-engineered clients, so there is **always a non-zero ban/restriction risk**. Always use a
dedicated throwaway number, never a primary personal/business number.

Local clone (reference source of truth): `C:\Users\ratik\Documents\GitHub\OpenWA`
Docs live in `docs/` (30 files). Always read the relevant one before doing work:
- `docs/03-system-architecture.md` — architecture
- `docs/04-security-design.md` — threat model, secrets
- `docs/06-api-specification.md` — full API reference (also `openapi.json` at repo root)
- `docs/12-troubleshooting-faq.md` — common failures
- `docs/16-risk-management.md` — protocol-change/ban risk analysis
- `docs/13-horizontal-scaling.md` — IMPORTANT: single-instance only (live engines held in-process)

## Architecture

- **Runtime**: Node.js 22 LTS, **NestJS 11**, TypeScript 6, TypeORM.
- **Engine abstraction** (`src/engine/`, `IWhatsAppEngine` interface): two built-in engines, chosen by
  `ENGINE_TYPE`:
  - `whatsapp-web.js` (DEFAULT) — Puppeteer/Chromium, ~300-500 MB RAM/session, lower ban profile.
  - `baileys` — native WebSocket/Noise protocol, ~30-80 MB/session, higher ban profile.
  Engine status machine: disconnected → initializing → qr_ready → authenticating → ready /
  failed. Engine factory resolves engines through the **plugin loader** (`src/plugins/engines/`).
- **Two named TypeORM connections**:
  - `main` — always SQLite (`./data/main.sqlite`), owns auth (`api_keys`) + audit (`audit_logs`).
  - `data` — pluggable user data: SQLite (default) or PostgreSQL via `DATABASE_TYPE`. Owns
    sessions/webhooks/messages/templates/engines + integration-fabric + status-store entities.
- **Pluggable backends** (config-driven, no code change): storage (`local` | `s3` via `STORAGE_TYPE`,
  MinIO = s3 backend with `S3_ENDPOINT`), cache (Redis `REDIS_ENABLED` or fail-open no-op), engine.
- **Single-instance**: live engines are held in an in-process Map. One API instance per session-data
  volume; no horizontal multi-replica.
- **Identity contract** (`src/engine/identity/wa-id.ts`): engine-neutral ids — `<phone>@c.us` (user),
  `<id>@g.us` (group), `<lid>@lid` (privacy id, phone unknown), `status@broadcast`, `<id>@newsletter`.
- **27 feature modules** in `src/modules/` (session, message, webhook, contact, group, template,
  label, profile, catalog, channel, status, search, stats, call, auth, queue, integration, plugins,
  mcp, events, infra, docker, settings, metrics, audit, health, status-store).
- **Dashboard**: React + Vite SPA in `dashboard/`, bundled INTO the API image and served by NestJS
  on the same port. No separate dashboard container.
- **SDKs** in `sdk/`: go, java, javascript, php, python.

## Ports

- `2785` — API + dashboard + Swagger (`/api/docs`) on one port (dev and prod).
- `2886` — dashboard Vite dev server with hot reload (`npm run dev`).

## Quick start

```bash
git clone https://github.com/rmyndharis/OpenWA.git
cd OpenWA
# Docker (recommended dev):
docker compose -f docker-compose.dev.yml up -d   # dashboard + API at http://localhost:2785
# OR local dev:
npm ci
npm run dev        # API :2785, dashboard :2886
```

Production compose: `docker compose up -d` (SQLite/local), `--profile postgres`,
`--profile full` (Postgres + Redis + MinIO). The API container is hardened: non-root (dumb-init →
entrypoint chown → gosu drop), read-only rootfs, cap_drop ALL, pids/mem limits, and a
`docker-proxy` sidecar (tecnativa/docker-socket-proxy) is the only container touching
`/var/run/docker.sock` (via `DOCKER_HOST=tcp://docker-proxy:2375`). Official GHCR multi-arch
(amd64/arm64).

## Core API flow

```bash
# Create session → start → QR
curl -X POST http://localhost:2785/api/sessions -H "X-API-Key: $KEY" -d '{"name":"my-bot"}'
curl -X POST http://localhost:2785/api/sessions/{id}/start -H "X-API-Key: $KEY"
curl http://localhost:2785/api/sessions/{id}/qr -H "X-API-Key: $KEY"
# Send text
curl -X POST http://localhost:2785/api/sessions/{id}/messages/send-text -H "X-API-Key: $KEY" \
  -d '{"chatId":"628123456789@c.us","text":"Hello from OpenWA!"}'
# Webhook (HMAC signed)
curl -X POST http://localhost:2785/api/sessions/{id}/webhooks -H "X-API-Key: $KEY" \
  -d '{"url":"https://your-server.com/webhook","events":["message.received","session.status"],"secret":"hmac-secret"}'
```

Webhooks support smart pre-dispatch filters (conditions on sender/recipient/body/type/mentions/
fromMe/hasMedia/isGroup) and are HMAC-signed. Full events: message.received/sent/ack/revoked/edited,
session.status, qr_code, group.join/leave/update, call.received, message.edited, channel.*, status.*.

## MCP server (AI agents)

Off by default. `MCP_ENABLED=true` mounts a stateless Streamable-HTTP MCP server at `POST /mcp` on
the same port (~39 curated tools). `MCP_READONLY=true` = read-only tools. Auth via
`Authorization: Bearer <API_KEY>` or `X-API-Key`. For agents, mint a dedicated least-privilege,
session-scoped OPERATOR key — the key must NOT carry an `allowedIps` list (no genuine client IP over
MCP). Rate limits: `MCP_RATE_LIMIT_MAX` (60), `MCP_RATE_LIMIT_WINDOW_MS` (60000). Do not expose
`/mcp` publicly without a fronting auth proxy.

## Key env vars (`.env.example` is the source of truth; most dashboard-owned keys ship commented)

`PORT` (2785), `NODE_ENV`, `LOG_LEVEL`, `DOMAIN`, `BASE_URL`/`DASHBOARD_URL`, `CORS_ORIGINS`,
`TRUSTED_PROXIES`, `ENGINE_TYPE`, `DATABASE_TYPE` (sqlite|postgres), `DATABASE_*`, `REDIS_ENABLED`,
`STORAGE_TYPE` (local|s3), `S3_*`, `API_MASTER_KEY`, `API_KEY_PEPPER`, `ALLOW_DEV_API_KEY`,
`WEBHOOK_TIMEOUT`/`RETRY_DELAY`/`SSRF_PROTECT`, `RATE_LIMIT_*`, `AUTO_START_SESSIONS`,
`MAX_CONCURRENT_SESSIONS`, `SEARCH_ENABLED`, `MCP_ENABLED`, `MCP_READONLY`, `ENABLE_SWAGGER`,
`PLUGINS_DIR`.

Config precedence: `process env > .env > data/.env.generated` (dashboard-saved). A shipped-uncommented
`.env` value pins the setting and shadows dashboard controls. ENCRYPTION: API keys are SHA-256
(plain) by default; set `API_KEY_PEPPER` for HMAC-SHA256 (re-issue all keys after enabling).
Production refuses to boot with default/placeholder secrets.

## Security notes

- Auth = API keys (`X-API-Key` / `Authorization: Bearer`), roles (ADMIN/OPERATOR/VIEWER) + optional
  per-session scoping + per-key `allowedIps` CIDR whitelist. Rate limiting: 3 tiers (short/medium/long).
- SSRF guard on webhook delivery + server-side media fetches (`WEBHOOK_SSRF_PROTECT` default on;
  `SSRF_ALLOWED_HOSTS` escape hatch). Audit logging on admin/auth/plugin/keystore operations.
- Put a TLS reverse proxy in front for anything internet-facing (API key travels in cleartext over
  plain HTTP).
- Safe-sending guardrails (from README): warm up fresh numbers, don't cold-blast strangers, use the
  rate limiter, prefer opted-in recipients, keep an SMS/official-Cloud fallback for auth-critical flows.

## Anti-ban guidance (important for client deployments)

- Dedicated number only; never the client's primary number.
- First message to a brand-new contact can be silently dropped server-side (WhatsApp trust policy).
- `whatsapp-web.js` = safer but heavier; `baileys` = denser but riskier.
- Residential proxy supported per-session (proxyUrl/proxyType on POST /api/sessions, wwebjs only).
- Regulated use (health/finance/EU-GDPR): NOT approved — use Meta's official WhatsApp Cloud API.

## Applying to a happyhunterdigital repo

When wiring OpenWA for one of the user's repos/accounts: stand up the instance (docker compose, or
SQLite + local storage for a small number of sessions), create a session, scan the QR with a
dedicated number, mint an API key, register an HMAC webhook, and use the REST API (or an n8n node)
for messaging automation. Add `MCP_ENABLED=true` only with a scoped key if an AI agent needs to drive
it. Verify with GET /api/health/ready and the dashboard.

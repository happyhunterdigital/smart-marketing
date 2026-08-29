# AGENTS.md — smart-marketing

Compact, high-signal guide for OpenCode/agents working in this repo. Skip generic advice; trust executable sources over prose.

## Project shape (what's real)
- **Monorepo, but only one deployable app:** `apps/web/` (Next.js 15.4.6, `output: 'export'`, `images.unoptimized: true` → `apps/web/out/`). Root has no `opencode.json`, no workspace `package.json`. `functions/` is secondary (Cloud Functions) and not required for landing deploy.
- **Hosting:** Firebase Hosting target `smart-marketing` (`firebase.json:2`, `.firebaserc:3`). **Deploy project MUST be `happy-hunter-systems`** — SA is `firebase-adminsdk-fbsvc@happy-hunter-systems.iam.gserviceaccount.com`; `smart-marketing-81602` is not accessible (`gcloud projects list` only returns `happy-hunter-systems`; `describe smart-marketing-81602` → permission denied). Previous `smart-marketing-81602` deploys will 401/403.
- **Build artifact for deploy:** `apps/web/out` (static export). Do not edit `out/` manually; it is `.gitignore`'d.

## Brand is law — `BRAND.md`
- **Single source of truth** for all UI/voice. One canvas (`#050505` bg, `#0a0a0a` cards, `rgba(255,255,255,0.05)` hairlines) + one signal (`#f59e0b`/`#fbbf24` amber). Any second hue (purple/indigo/blue) is a bug — only semantic exceptions (`#25D366` WhatsApp green, `#22c55e`/`#ef4444` status) are allowed.
- **Type:** `CalSans`/`Clash Display`/`Syne` display + `Inter` body + `JetBrains Mono` labels. Uppercase labels `10px 900 0.2em`, CTAs `black on amber, uppercase 0.08–0.15em`.
- **Components:** double-bezel `p-1.5 rounded-[2rem]` + inner `rounded-[calc(2rem-0.375rem)]`, amber glow `0 0 40px rgba(251,191,36,0.15)`, macro whitespace `py-24–40`, `pointer-events-none` fixed glows only.
- **Images are Cloudinary, not picsum.** Hero: `...Digital_brain_with_marketing_icons_..._t1yzqq.jpg`; cards: `CRM_ead3lc.jpg`, `Google_Maps_business_auditor_kqssi2.jpg`, `WhatsAppBot_op9wpe.jpg`, `InstagramDM_ick4fw.jpg`. Do not reintroduce `picsum.photos`.

## Commands (copy-paste exact)
- **Web build (verified):** `cd apps/web && npm ci && npm run build` — succeeds even without `.env.local` because `lib/firebase/config.ts:8` has dummy fallbacks (`AIzaSyDummyKeyForBuildOnly_DoNotUse`, `dummy.firebaseapp.com`, etc.). Do not remove fallbacks; they are required for CI `collecting page data` stage.
- **Dev:** `cd apps/web && npm run dev` (README says `bun`, but `package-lock.json` + CI use `npm ci` — match CI).
- **Lint only:** `npm run lint` at `apps/web`. No test/typecheck script beyond Next lint; don't invent.
- **Single-page focused verification:** rebuild web only; functions not needed to verify landing — `npm run build` at `apps/web` is the gate.

## CI — `.github/workflows/deploy.yml`
- **Stack:** `actions/checkout@v5` + `actions/setup-node@v5` `node-version: 24` + `google-github-actions/auth@v3` (`credentials_json: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}`) + `firebase-tools@13`.
- **Secrets-written env:** `.env.local` from `FIREBASE_*` + `STRIPE_*`; `functions/.env` from `GEMINI_API_KEY`/`PLACES_API_KEY`. Do not commit `.env.local` (gitignored).
- **Deploy split (intentional):** `hosting:smart-marketing,firestore:rules` (blocking) + `functions` (`continue-on-error: true`) — isolates `iam.serviceAccounts.ActAs` flakes on `happy-hunter-systems`. Deploy targets `--project happy-hunter-systems`. Don't revert to `smart-marketing-81602`.
- **Node warnings:** `firebase-tools@13` warns `superstatic@9.2.0` requires `18||20||22` on Node 24 — non-blocking; ignore. Don't downgrade Node to silence.

## Architecture & entrypoints
- **Pages (Pages Router, not App Router):** `apps/web/pages/index.tsx` (landing), `login.tsx` (+ `signup.tsx` → redirect to `login`), `onboarding/index.tsx` (role picker), `dashboard/{index,crm,gmaps-scraper,whatsapp,jobs,billing}.tsx`, `_app.tsx` (global loader, auth gate), `_document.tsx` (fonts).
- **Styling:** `styles/globals.css` is `@import "tailwindcss"` + Google Fonts + `@tailwindcss/postcss` (`postcss.config.js`). Tailwind v4; no `tailwind.config.js`. Custom brand CSS variables live after Tailwind import — don't reorder `@import` before `tailwindcss`.
- **Icons:** `lucide-react`; **motion:** `framer-motion` (`SpotlightCard.tsx`, `RoiCalculator.tsx`). Use `motion` not `framer-motion` legacy import.
- **Firebase:** `lib/firebase/config.ts` (initialization + fallback), `firestore.rules` (users/{uid}: `hasOnly(['gmapsQuota','freeAuditsUsed','plan','displayName','email','photoURL','role'])`). Changing rules requires `firebase deploy --only firestore:rules`.
- **Onboarding:** `components/onboarding/types.ts` (`RoleId = 'learner'|'instructor'|'organization'`) → `RolePickerStep.tsx` (amber brand mapping of indent-based indigo spec) → `pages/onboarding/index.tsx` (persists `users/{uid}.role`, routes `organization`→`/dashboard/billing`).

## Conventions that break if guessed
- **UI GitHub links are banned.** `apps/web/pages/index.tsx`, `components/DashboardLayout.tsx`, `dashboard/index.tsx`, `dashboard/crm.tsx` must contain zero `https://github.com` anchors — they were explicitly removed per owner. Don't re-add.
- **Responsive breakpoints are internal, not a public section.** Image spec `≤480, ≤768 (Landscape), ≤834, ≤1024 (Landscape), ≤1440` maps to CSS `max-width: 480px, 768px, 834px, 1024px, 1440px`. The former public `breakpoints-grid` section was removed intentionally — optimize styles via media queries instead of rendering a grid.
- **Whitespace > density.** `BRAND.md:6` macro whitespace + high-end minimalist: `py-24–40` sections, `gap-6` → `gap-1px` grids were flagged as clustered. Prefer air, 1px hairline dividers, and asymmetric editorial grids over dense 3-equal-card bento.
- **Single-word lockup:** `happyhunterdigital` inline (`w-name`/`wm-name` `inline-flex`, `happy` white + `hunter` amber + `digital` white) + sub `Smart Marketing` — not stacked `happy`/`hunter`.

## Setup gotchas
- **Firebase console auth:** Enable Email/Password + Google at `happy-hunter-systems` project. Set project public name `happyhunterdigital` + support `happyhunterdigital@gmail.com` to unblock Google sign-in (was blocking `smart-marketing-81602` similarly).
- **No local tests.** Verification = `npm run build` + manual `out/` check; `gh run list --repo happyhunterdigital/smart-marketing` for CI.
- **Lockfile is `apps/web/package-lock.json` (npm), not Bun.** Use `npm ci` in CI and locally to avoid drift.

## References
- `BRAND.md` (brand law), `firebase.json`/`firestore.rules` (deploy surface), `.github/workflows/deploy.yml` (executable CI truth), `apps/web/next.config.js` + `postcss.config.js` + `styles/globals.css` (toolchain).

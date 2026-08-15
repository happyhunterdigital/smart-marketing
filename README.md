# Smart Marketing - All-in-One Marketing Tools Platform

A collection of self-hosted marketing tools for automated lead generation, customer engagement, and autonomous sales outreach.

## Tools

- **Happy Hunter CRM** - Agentic-first CRM designed for AI agents ([happyhunterdigital/crm](https://github.com/happyhunterdigital/crm))
- **Google Maps Scraper** - Extract business leads from Google Maps ([happyhunterdigital/google-maps-scraper](https://github.com/happyhunterdigital/google-maps-scraper))
- **OpenReply** - Instagram comment-to-DM automation
- **OpenWA** - Self-hosted WhatsApp API gateway
- **Social Analyzer** - OSINT username search across social networks
- **OpenMontage** - Agent-first AI video production

## Project Structure

```
smart-marketing/
├── README.md
├── apps/
│   └── web/                 # Next.js frontend dashboard
│       ├── pages/
│       │   ├── dashboard/
│       │   │   ├── crm.tsx            # Happy Hunter CRM Control Center
│       │   │   ├── gmaps-scraper.tsx  # Google Maps Lead Extraction
│       │   │   ├── index.tsx          # Master Platform Dashboard
│       │   │   ├── jobs.tsx           # Background Jobs Tracking
│       │   │   └── billing.tsx        # Subscriptions & Billing
│       │   ├── login.tsx
│       │   └── signup.tsx
│       ├── components/
│       ├── styles/
│       ├── package.json
│       └── .env.local
├── skills/                  # Tool documentation and guides
│   ├── happyhunter-crm/     # Happy Hunter Agentic CRM skill
│   ├── compai-crm/
│   ├── google-maps-scraper/
│   ├── openmontage/
│   ├── openreply/
│   ├── openwa/
│   └── social-analyzer/
└── package.json (workspace)
```

## Quick Start

### Prerequisites

- Node.js 20+ or Bun
- Firebase project with Authentication, Firestore, and Storage enabled
- Stripe account for payment processing

### Setup

1. Clone this repo:
```bash
git clone https://github.com/happyhunterdigital/smart-marketing
cd smart-marketing
```

2. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named `smart-marketing`
   - Enable Email/Password authentication
   - Enable Firestore and Storage
   - Add a web app to the project

3. Configure the web app environment:
```bash
cd apps/web
cp .env.local.example .env.local
# Edit .env.local with your Firebase config
```

4. Install dependencies and start development server:
```bash
bun install
bun dev
```

Visit `http://localhost:3000` to access the dashboard.

## Architecture

- **Frontend:** Next.js (React) dashboard hosted on Vercel
- **Authentication:** Firebase Authentication
- **Database:** Firestore
- **Storage:** Firebase Storage
- **Billing:** Stripe Checkout
- **Autonomous CRM Agent:** Eve Agent + NestJS tRPC + Next.js 16 ([happyhunterdigital/crm](https://github.com/happyhunterdigital/crm))

## Available Dashboards & Modules

The dashboard currently supports:
- `/dashboard` - Overview of all integrated marketing & lead generation tools
- `/dashboard/crm` - Happy Hunter CRM agent status, pipeline sync & research dispatch
- `/dashboard/gmaps-scraper` - Google Maps lead extraction
- `/dashboard/jobs` - View and track asynchronous background jobs
- `/dashboard/billing` - Pricing and subscription management

## Contributing

See individual tool documentation in the `skills/` directory.

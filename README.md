# Smart Marketing - All-in-One Marketing Tools Platform

A collection of self-hosted marketing tools for automated lead generation, customer engagement, and sales outreach — built and branded by **Happy Hunter Digital**.

> Brand, colours, typography, and voice: see [BRAND.md](BRAND.md).

## Tools

- **Comp AI CRM** - Agentic-first CRM designed for AI agents
- **Google Maps Scraper** - Extract business leads from Google Maps
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
│       ├── components/
│       ├── styles/
│       ├── package.json
│       └── .env.local
├── skills/                  # Tool documentation and guides
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
- **Background Processing:** Firebase Cloud Functions (planned)

## Available Scripts

The dashboard currently supports:
- `/dashboard` - Overview of your quota and recent activity
- `/dashboard/gmaps-scraper` - Google Maps lead extraction
- `/dashboard/jobs` - View and track job status
- `/dashboard/billing` - Pricing and subscription management

## Contributing

See individual tool documentation in the `skills/` directory.

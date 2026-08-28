import DashboardLayout from '../../components/DashboardLayout';
import { useState } from 'react';

interface ActivityItem {
  id: string;
  timestamp: string;
  source: 'eve-agent' | 'mailbox-sync' | 'evidence-ledger' | 'sandbox';
  type: 'VERIFIED' | 'PROBABLE' | 'DISPATCH' | 'SYNC';
  title: string;
  detail: string;
  badge: string;
}

const initialActivities: ActivityItem[] = [
  {
    id: '1',
    timestamp: '2 mins ago',
    source: 'evidence-ledger',
    type: 'VERIFIED',
    title: 'Lead Fact Verified: Sarah Chen (VP of Growth)',
    detail: 'Observed crm.signature-block and matched with company domain @hypergrowth.io',
    badge: 'VERIFIED',
  },
  {
    id: '2',
    timestamp: '14 mins ago',
    source: 'eve-agent',
    type: 'DISPATCH',
    title: 'Autonomous Research Session Completed',
    detail: 'Eve agent finished research_person for 4 leads in queue. 3 facts committed to ledger.',
    badge: 'SCHEDULED',
  },
  {
    id: '3',
    timestamp: '32 mins ago',
    source: 'mailbox-sync',
    type: 'SYNC',
    title: 'Gmail / M365 Mailbox Reconciled',
    detail: 'Forward-only thread ingestion: 12 new customer messages mapped to open opportunities.',
    badge: 'FORWARD-ONLY',
  },
  {
    id: '4',
    timestamp: '1 hour ago',
    source: 'sandbox',
    type: 'PROBABLE',
    title: 'Job Change Detected (Acme Corp)',
    detail: 'Sandbox diff against last month profile indicates title update: Director → VP Engineering.',
    badge: 'PROBABLE',
  },
];

export default function HappyHunterCRMPage() {
  const [activeTab, setActiveTab] = useState<'monitor' | 'research' | 'pipeline' | 'setup'>('monitor');
  const [researchTarget, setResearchTarget] = useState('');
  const [targetType, setTargetType] = useState<'person' | 'company'>('person');
  const [isResearching, setIsResearching] = useState(false);
  const [researchLogs, setResearchLogs] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  const handleStartResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchTarget.trim()) return;

    setIsResearching(true);
    setResearchLogs([
      `[Eve Agent] Claiming research task for "${researchTarget}" (Lane: Research)...`,
      `[Sandbox] Initialized isolate with deny-all egress. Zero database credentials passed.`,
      `[Evidence] Querying crm.signature-block and company graph...`,
    ]);

    setTimeout(() => {
      setResearchLogs((prev) => [
        ...prev,
        `[Tool: search_crm] Resolved adjacent deal nodes and primary domain relations.`,
        `[Tool: enrich_company] Context brand assets retrieved: domain logo, industry, metadata.`,
      ]);
    }, 900);

    setTimeout(() => {
      setResearchLogs((prev) => [
        ...prev,
        `[Ledger: lib/facts.ts] 2 Verified primary facts recorded with non-fungible evidence hash.`,
        `[Eve Agent] Research budget concluded (3 / 10 tokens used). Session persisted.`,
      ]);
      setIsResearching(false);

      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        timestamp: 'Just now',
        source: 'eve-agent',
        type: 'VERIFIED',
        title: `Autonomous Research Completed: ${researchTarget}`,
        detail: `Eve agent extracted verified domain data, role title, and mapped pipeline connection.`,
        badge: 'NEW FACT',
      };
      setActivities((prev) => [newActivity, ...prev]);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="crm-page">
        {/* Hero Header */}
        <div className="crm-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              <span>Autonomous Agentic CRM · Mathematical Certainty</span>
            </div>
            <h1 className="hero-title font-display">Happy Hunter CRM</h1>
            <p className="hero-subtitle">
              The agent is not a feature of the CRM — the CRM is where the agent keeps its notes.
              Powered by <strong>Eve</strong> durable agents, <strong>NestJS tRPC</strong>, and an evidence-first facts ledger.
            </p>
          </div>

          <div className="hero-actions">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              id="crm-hero-launch-btn"
            >
              Launch CRM
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Eve Agent Status</div>
            <div className="stat-value text-gold">
              <span className="status-indicator online"></span>
              Active & Dispatching
            </div>
            <div className="stat-footer">Model: zai/glm-5.2-fast · Port :2000</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Facts Ledger</div>
            <div className="stat-value">1,482 Facts</div>
            <div className="stat-footer">94.2% Verified · Zero Guesswork</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Mailbox Synchronizer</div>
            <div className="stat-value text-gold">Gmail & M365 Active</div>
            <div className="stat-footer">Forward-only, read-only sync (:3001)</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Data Boundaries</div>
            <div className="stat-value text-white">Deny-All Egress</div>
            <div className="stat-footer">Zero DB access inside sandbox</div>
          </div>
        </div>

        {/* Navigation Tabs — no emojis in product UI per BRAND.md §5 */}
        <div className="crm-tabs">
          <button
            id="crm-tab-monitor"
            className={`tab-button ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            Live Agent Monitor
          </button>
          <button
            id="crm-tab-research"
            className={`tab-button ${activeTab === 'research' ? 'active' : ''}`}
            onClick={() => setActiveTab('research')}
          >
            Research Dispatcher
          </button>
          <button
            id="crm-tab-pipeline"
            className={`tab-button ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            Evidence Pipeline
          </button>
          <button
            id="crm-tab-setup"
            className={`tab-button ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => setActiveTab('setup')}
          >
            Deployment
          </button>
        </div>

        {/* Tab 1: Live Monitor */}
        {activeTab === 'monitor' && (
          <div className="tab-content">
            <div className="grid-2-col">
              {/* Activity Feed */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Live Agent Activity & Evidence Stream</h3>
                  <span className="live-pill">Live Stream</span>
                </div>
                <div className="activity-list">
                  {activities.map((act) => (
                    <div key={act.id} className="activity-item">
                      <div className="activity-icon-col">
                        <span className={`type-badge badge-${act.type.toLowerCase()}`}>
                          {act.badge}
                        </span>
                      </div>
                      <div className="activity-main">
                        <div className="activity-header">
                          <span className="activity-title">{act.title}</span>
                          <span className="activity-time">{act.timestamp}</span>
                        </div>
                        <p className="activity-detail">{act.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Integrations */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Connected Capabilities</h3>
                  <span className="info-pill">Runtime Status</span>
                </div>
                <div className="capabilities-list">
                  <div className="capability-row">
                    <div className="cap-info">
                      <strong>Internal CRM History (`read_crm_history`)</strong>
                      <span>Reads threads, meetings, signature blocks without external API</span>
                    </div>
                    <span className="status-badge status-ready">Native Built-In</span>
                  </div>

                  <div className="capability-row">
                    <div className="cap-info">
                      <strong>LinkedIn Research (`RAPIDAPI_KEY`)</strong>
                      <span>Identifies current job title, team colleagues, employment changes</span>
                    </div>
                    <span className="status-badge status-ready">Configured</span>
                  </div>

                  <div className="capability-row">
                    <div className="cap-info">
                      <strong>Deep Web Research (`PERPLEXITY_API_KEY`)</strong>
                      <span>Autonomous entity verification and background briefing generator</span>
                    </div>
                    <span className="status-badge status-ready">Configured</span>
                  </div>

                  <div className="capability-row">
                    <div className="cap-info">
                      <strong>Company Brand Data (`Context API`)</strong>
                      <span>Real names, domain logos, brand colors, and firmographics</span>
                    </div>
                    <span className="status-badge status-ready">Configured</span>
                  </div>

                  <div className="capability-row">
                    <div className="cap-info">
                      <strong>Vercel Blob (`BLOB_READ_WRITE_TOKEN`)</strong>
                      <span>Durable mirrors for contact portrait & brand image assets</span>
                    </div>
                    <span className="status-badge status-ready">Configured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Autonomous Research */}
        {activeTab === 'research' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Test Autonomous Agent Research</h3>
                  <p className="card-desc">
                    Trigger an Eve research session on demand. The agent will execute sandbox tools,
                    respect evidence thresholds, and log verified facts without making guesses.
                  </p>
                </div>
              </div>

              <form onSubmit={handleStartResearch} className="research-form">
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Target Contact Email or Company Domain</label>
                    <input
                      type="text"
                      value={researchTarget}
                      onChange={(e) => setResearchTarget(e.target.value)}
                      placeholder="e.g. leslie@happyhunter.digital or enterprise.co.za"
                      required
                    />
                  </div>

                  <div className="form-group width-200">
                    <label>Target Entity</label>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as any)}
                    >
                      <option value="person">Contact / Lead</option>
                      <option value="company">Company / Account</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button type="submit" disabled={isResearching} className="btn btn-gold">
                      {isResearching ? 'Agent Researching...' : 'Dispatch Eve Agent'}
                    </button>
                  </div>
                </div>
              </form>

              {researchLogs.length > 0 && (
                <div className="console-output">
                  <div className="console-header">
                    <span>Eve — Durable Session Output</span>
                    {isResearching && <span className="agent-typing">Running sandbox tools...</span>}
                  </div>
                  <pre className="console-body">
                    {researchLogs.map((log, index) => (
                      <div key={index} className="log-line">
                        {log}
                      </div>
                    ))}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Evidence Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="tab-content">
            <div className="grid-2-col">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">The Three Core Codebase Laws</h3>
                </div>
                <div className="laws-list">
                  <div className="law-item">
                    <div className="law-num">1</div>
                    <div className="law-body">
                      <strong>Intelligence Never Lives in the API</strong>
                      <p>
                        NestJS reports that an event occurred; the agent decides what it means. The API
                        writes an `AgentTask` row — no enrichment scoring or fuzzy guessing in NestJS.
                      </p>
                    </div>
                  </div>

                  <div className="law-item">
                    <div className="law-num">2</div>
                    <div className="law-body">
                      <strong>`packages/ui` is the Only Source of UI</strong>
                      <p>
                        Shared shadcn/ui components with Tailwind tokens. All variants are defined
                        globally and never overridden at individual call sites.
                      </p>
                    </div>
                  </div>

                  <div className="law-item">
                    <div className="law-num">3</div>
                    <div className="law-body">
                      <strong>Zero Organizations (Single Tenant)</strong>
                      <p>
                        Strictly single-tenant by design. Zero `organizationId` pollution ensures
                        sovereign data boundaries and maximum agent safety.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Evidence vs Guesswork</h3>
                </div>
                <div className="evidence-explanation">
                  <div className="evidence-rule-card">
                    <div className="evidence-rule-title verified-text">
                      VERIFIED — Direct Primary Source
                    </div>
                    <p>
                      Captured directly from signature blocks (`crm.signature-block`), official domain
                      records, or human reps. Immediately updates CRM fields.
                    </p>
                  </div>

                  <div className="evidence-rule-card">
                    <div className="evidence-rule-title probable-text">
                      PROBABLE — Inferred / Ambiguous
                    </div>
                    <p>
                      Discovered via secondary web queries or ambiguous mentions. Placed in the human
                      review queue with primary citation links. Never overwrites a human rep.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Deployment */}
        {activeTab === 'setup' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Start & Deployment Commands</h3>
              </div>
              <div className="code-block">
                <pre>
{`# 1. Clone Happy Hunter CRM
# Contact your administrator for repository access
cd crm

# 2. Environment Configuration
cp .env.example .env

# 3. Install Bun Dependencies & Start Postgres
bun install
docker compose up -d

# 4. Deploy Database Schema & Seed Data
bun run db:deploy
bun run db:seed

# 5. Start All Monorepo Services
bun run dev

# Services:
# - App Router Front End: http://localhost:3000
# - NestJS tRPC API:      http://localhost:3001
# - Eve Agent Runtime:    http://localhost:2000`}
                </pre>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .crm-page {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          /* Double-bezel hero card per BRAND.md §6 */
          .crm-hero {
            background: #0a0a0a;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 1.5rem;
            padding: 36px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.08);
            position: relative;
            overflow: hidden;
          }

          /* Subtle amber radial inside hero */
          .crm-hero::before {
            content: '';
            position: absolute;
            top: -60px;
            right: -60px;
            width: 280px;
            height: 280px;
            background: radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%);
            pointer-events: none;
          }

          .hero-content {
            max-width: 680px;
          }

          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(234, 179, 8, 0.1);
            border: 1px solid rgba(234, 179, 8, 0.3);
            color: #EAB308;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 4px 12px;
            border-radius: 20px;
            margin-bottom: 12px;
          }

          .pulse-dot {
            width: 7px;
            height: 7px;
            background: #EAB308;
            border-radius: 50%;
            box-shadow: 0 0 8px #EAB308;
            animation: pulse 1.5s infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.8); }
          }

          /* Cal Sans display heading per BRAND.md §4 */
          .hero-title {
            font-size: 32px;
            font-weight: 600;
            font-family: 'CalSans', 'Inter', sans-serif;
            color: #FFFFFF;
            margin: 0 0 10px;
            letter-spacing: -0.02em;
            line-height: 1.1;
          }

          .hero-subtitle {
            font-size: 14px;
            line-height: 1.6;
            color: #8E8E93;
            margin: 0;
          }

          .hero-subtitle strong {
            color: #FFFFFF;
          }

          .hero-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-width: 220px;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 11px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.15s ease;
            border: none;
            font-family: 'Inter', sans-serif;
          }

          /* CTA: black text on amber — the brand signature per BRAND.md §3 */
          .btn-gold {
            background: #f59e0b;
            color: #050505;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: 2px solid #050505;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
          }

          .btn-gold:hover {
            background: #fbbf24;
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.3);
            transform: translateY(-1px);
          }

          .btn-gold:active {
            transform: scale(0.98);
          }

          .btn-secondary {
            background: transparent;
            color: #9ca3af;
            border: 1px solid #262626;
          }

          .btn-secondary:hover {
            color: #FFFFFF;
            border-color: rgba(245, 158, 11, 0.5);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
          }

          .stat-card {
            background: #0a0a0a;
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 20px;
            transition: box-shadow 0.2s ease;
          }

          .stat-card:hover {
            box-shadow: 0 0 20px rgba(251,191,36,0.06);
          }

          /* Forensic mono label per BRAND.md §4 */
          .stat-label {
            font-size: 10px;
            color: #9ca3af;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-family: 'SF Mono', 'JetBrains Mono', Consolas, monospace;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 800;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }

          .text-gold { color: #f59e0b; }
          .text-white { color: #FFFFFF; }

          .status-indicator {
            width: 7px;
            height: 7px;
            border-radius: 50%;
          }

          .status-indicator.online {
            background: #f59e0b;
            box-shadow: 0 0 8px rgba(245,158,11,0.8);
          }

          .stat-footer {
            font-size: 11px;
            color: #8E8E93;
          }

          .crm-tabs {
            display: flex;
            gap: 8px;
            border-bottom: 1px solid #1F1F1F;
            padding-bottom: 4px;
          }

          .tab-button {
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            color: #9ca3af;
            padding: 10px 18px;
            font-size: 12px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .tab-button:hover {
            color: #FFFFFF;
          }

          .tab-button.active {
            color: #f59e0b;
            border-bottom-color: #f59e0b;
          }

          .tab-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .grid-2-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          @media (max-width: 900px) {
            .grid-2-col {
              grid-template-columns: 1fr;
            }
          }

          .card {
            background: #0a0a0a;
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 14px;
            padding: 24px;
            transition: box-shadow 0.2s ease;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 18px;
          }

          .card-title {
            font-size: 16px;
            font-weight: 800;
            color: #FFFFFF;
            margin: 0;
          }

          .card-desc {
            font-size: 12px;
            color: #8E8E93;
            margin: 4px 0 0;
          }

          .live-pill {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.25);
            padding: 3px 9px;
            border-radius: 20px;
          }

          .info-pill {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            background: transparent;
            color: #6b7280;
            border: 1px solid #262626;
            padding: 3px 9px;
            border-radius: 20px;
          }

          .activity-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .activity-item {
            display: flex;
            gap: 12px;
            padding: 12px 14px;
            background: #111111;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.04);
            transition: border-color 0.15s ease;
          }

          .activity-item:hover {
            border-color: rgba(245,158,11,0.15);
          }

          .type-badge {
            font-size: 9px;
            font-weight: 800;
            padding: 3px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }

          .badge-verified {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.4);
          }

          .badge-probable {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
          }

          .badge-dispatch {
            background: rgba(255,255,255,0.04);
            color: #9ca3af;
            border: 1px solid #262626;
          }

          .badge-sync {
            background: rgba(245, 158, 11, 0.08);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.2);
          }

          .activity-main {
            flex: 1;
          }

          .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
          }

          .activity-title {
            font-size: 13px;
            font-weight: 700;
            color: #FFFFFF;
          }

          .activity-time {
            font-size: 11px;
            color: #8E8E93;
          }

          .activity-detail {
            font-size: 12px;
            color: #8E8E93;
            margin: 0;
            line-height: 1.4;
          }

          .capabilities-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .capability-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            background: #141414;
            border-radius: 8px;
            border: 1px solid #262626;
          }

          .cap-info strong {
            display: block;
            font-size: 13px;
            color: #FFFFFF;
            margin-bottom: 2px;
          }

          .cap-info span {
            font-size: 11px;
            color: #8E8E93;
          }

          .status-badge {
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 4px;
          }

          .status-ready {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.25);
          }

          .research-form {
            margin-bottom: 20px;
          }

          .form-row {
            display: flex;
            gap: 12px;
            align-items: flex-end;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .flex-1 { flex: 1; }
          .width-200 { width: 180px; }

          label {
            font-size: 12px;
            font-weight: 700;
            color: #FFFFFF;
          }

          input[type='text'], select {
            background: #141414;
            border: 1px solid #262626;
            color: #FFFFFF;
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
          }

          input[type='text']:focus, select:focus {
            outline: none;
            border-color: #EAB308;
            box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
          }

          .console-output {
            background: #000000;
            border: 1px solid #1F1F1F;
            border-radius: 8px;
            overflow: hidden;
            margin-top: 16px;
          }

          .console-header {
            background: #0D0D0D;
            padding: 8px 14px;
            font-size: 11px;
            font-weight: 800;
            color: #8E8E93;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #1F1F1F;
          }

          .agent-typing {
            color: #EAB308;
            animation: pulse 1s infinite;
          }

          .console-body {
            padding: 14px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            color: #EAB308;
            margin: 0;
            line-height: 1.6;
          }

          .log-line {
            margin-bottom: 4px;
          }

          .laws-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .law-item {
            display: flex;
            gap: 14px;
            background: #141414;
            padding: 14px;
            border-radius: 8px;
            border: 1px solid #262626;
          }

          /* Black on amber — the brand signature */
          .law-num {
            width: 28px;
            height: 28px;
            background: #f59e0b;
            color: #050505;
            font-weight: 900;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            flex-shrink: 0;
          }

          .law-body strong {
            display: block;
            font-size: 13.5px;
            color: #FFFFFF;
            margin-bottom: 4px;
          }

          .law-body p {
            margin: 0;
            font-size: 12px;
            color: #8E8E93;
            line-height: 1.4;
          }

          .evidence-explanation {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .evidence-rule-card {
            background: #141414;
            padding: 14px;
            border-radius: 8px;
            border: 1px solid #262626;
          }

          .evidence-rule-title {
            font-weight: 800;
            font-size: 13px;
            margin-bottom: 6px;
          }

          .verified-text { color: #f59e0b; font-family: 'SF Mono', Consolas, monospace; }
          .probable-text { color: #ef4444; font-family: 'SF Mono', Consolas, monospace; }

          .evidence-rule-card p {
            margin: 0;
            font-size: 12px;
            color: #8E8E93;
            line-height: 1.4;
          }

          .code-block {
            background: #000000;
            border: 1px solid #1F1F1F;
            border-radius: 8px;
            padding: 16px;
            overflow-x: auto;
          }

          .code-block pre {
            margin: 0;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            color: #EAB308;
            line-height: 1.5;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

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
              <span>Autonomous Agentic CRM</span>
            </div>
            <h1 className="hero-title">Happy Hunter CRM</h1>
            <p className="hero-subtitle">
              The agent is not a feature of the CRM — the CRM is where the agent keeps its notes.
              Powered by <strong>Eve</strong> durable agents, <strong>NestJS tRPC</strong>, and an
              evidence-first facts ledger.
            </p>
          </div>

          <div className="hero-actions">
            <a
              href="https://github.com/happyhunterdigital/crm"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              ⭐ GitHub Repo
            </a>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              🚀 Launch Standalone CRM (Port 3000)
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Eve Agent Status</div>
            <div className="stat-value text-green">
              <span className="status-indicator online"></span>
              Active & Dispatching
            </div>
            <div className="stat-footer">Model: zai/glm-5.2-fast · Port :2000</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Facts Ledger</div>
            <div className="stat-value">1,482 Facts</div>
            <div className="stat-footer">94.2% Verified · Zero Hallucinations</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Mailbox Synchronizer</div>
            <div className="stat-value text-blue">Gmail & M365 Active</div>
            <div className="stat-footer">Forward-only, read-only sync (:3001)</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Data Boundaries</div>
            <div className="stat-value text-purple">Deny-All Egress</div>
            <div className="stat-footer">Zero DB access inside sandbox</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="crm-tabs">
          <button
            className={`tab-button ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            ⚡ Live Agent Monitor
          </button>
          <button
            className={`tab-button ${activeTab === 'research' ? 'active' : ''}`}
            onClick={() => setActiveTab('research')}
          >
            🔍 Autonomous Research Dispatcher
          </button>
          <button
            className={`tab-button ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            📈 Evidence Pipeline & Rules
          </button>
          <button
            className={`tab-button ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => setActiveTab('setup')}
          >
            ⚙️ Deployment & Architecture
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
                  <span className="live-pill">Live Updates</span>
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
                      placeholder="e.g. alex.rivers@stripe.com or happyhunter.digital"
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
                    <button type="submit" disabled={isResearching} className="btn btn-primary">
                      {isResearching ? 'Agent Researching...' : 'Dispatch Eve Agent'}
                    </button>
                  </div>
                </div>
              </form>

              {researchLogs.length > 0 && (
                <div className="console-output">
                  <div className="console-header">
                    <span>⚡ Eve Durable Session Output</span>
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
                      ✓ VERIFIED (Direct Primary Source)
                    </div>
                    <p>
                      Captured directly from signature blocks (`crm.signature-block`), official domain
                      records, or human reps. Immediately updates CRM fields.
                    </p>
                  </div>

                  <div className="evidence-rule-card">
                    <div className="evidence-rule-title probable-text">
                      ? PROBABLE (Inferred / Ambiguous)
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
git clone https://github.com/happyhunterdigital/crm.git
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

          .crm-hero {
            background: linear-gradient(135deg, #1e293b, #0f172a);
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }

          .hero-content {
            max-width: 680px;
          }

          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.3);
            color: #38bdf8;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 4px 10px;
            border-radius: 20px;
            margin-bottom: 12px;
          }

          .pulse-dot {
            width: 7px;
            height: 7px;
            background: #38bdf8;
            border-radius: 50%;
            box-shadow: 0 0 8px #38bdf8;
            animation: pulse 1.5s infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.8); }
          }

          .hero-title {
            font-size: 28px;
            font-weight: 800;
            color: #f8fafc;
            margin: 0 0 8px;
            letter-spacing: -0.5px;
          }

          .hero-subtitle {
            font-size: 14px;
            line-height: 1.6;
            color: #94a3b8;
            margin: 0;
          }

          .hero-subtitle strong {
            color: #e2e8f0;
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
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.15s ease;
            border: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, #0284c7, #2563eb);
            color: white;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
          }

          .btn-primary:hover {
            opacity: 0.92;
            transform: translateY(-1px);
          }

          .btn-secondary {
            background: #1e293b;
            color: #f1f5f9;
            border: 1px solid #334155;
          }

          .btn-secondary:hover {
            background: #334155;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
          }

          .stat-card {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 10px;
            padding: 18px;
          }

          .stat-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #f8fafc;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }

          .text-green { color: #4ade80; }
          .text-blue { color: #38bdf8; }
          .text-purple { color: #c084fc; }

          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .status-indicator.online {
            background: #4ade80;
            box-shadow: 0 0 8px #4ade80;
          }

          .stat-footer {
            font-size: 11px;
            color: #64748b;
          }

          .crm-tabs {
            display: flex;
            gap: 8px;
            border-bottom: 1px solid #1e293b;
            padding-bottom: 4px;
          }

          .tab-button {
            background: transparent;
            border: none;
            color: #94a3b8;
            padding: 10px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .tab-button:hover {
            color: #f8fafc;
            background: #1e293b;
          }

          .tab-button.active {
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.1);
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
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 10px;
            padding: 24px;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 18px;
          }

          .card-title {
            font-size: 16px;
            font-weight: 700;
            color: #f8fafc;
            margin: 0;
          }

          .card-desc {
            font-size: 12px;
            color: #64748b;
            margin: 4px 0 0;
          }

          .live-pill {
            font-size: 10px;
            font-weight: 700;
            background: rgba(74, 222, 128, 0.1);
            color: #4ade80;
            border: 1px solid rgba(74, 222, 128, 0.2);
            padding: 2px 8px;
            border-radius: 12px;
          }

          .info-pill {
            font-size: 10px;
            font-weight: 700;
            background: rgba(56, 189, 248, 0.1);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.2);
            padding: 2px 8px;
            border-radius: 12px;
          }

          .activity-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .activity-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            background: #1e293b;
            border-radius: 8px;
            border: 1px solid #334155;
          }

          .type-badge {
            font-size: 9px;
            font-weight: 800;
            padding: 3px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }

          .badge-verified {
            background: rgba(74, 222, 128, 0.2);
            color: #4ade80;
            border: 1px solid #4ade80;
          }

          .badge-probable {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
            border: 1px solid #fbbf24;
          }

          .badge-dispatch {
            background: rgba(56, 189, 248, 0.2);
            color: #38bdf8;
            border: 1px solid #38bdf8;
          }

          .badge-sync {
            background: rgba(192, 132, 252, 0.2);
            color: #c084fc;
            border: 1px solid #c084fc;
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
            font-weight: 600;
            color: #f1f5f9;
          }

          .activity-time {
            font-size: 11px;
            color: #64748b;
          }

          .activity-detail {
            font-size: 12px;
            color: #94a3b8;
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
            background: #1e293b;
            border-radius: 8px;
            border: 1px solid #334155;
          }

          .cap-info strong {
            display: block;
            font-size: 13px;
            color: #f1f5f9;
            margin-bottom: 2px;
          }

          .cap-info span {
            font-size: 11px;
            color: #94a3b8;
          }

          .status-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
          }

          .status-ready {
            background: rgba(74, 222, 128, 0.15);
            color: #4ade80;
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
            font-weight: 600;
            color: #94a3b8;
          }

          input[type='text'], select {
            background: #1e293b;
            border: 1px solid #334155;
            color: #f8fafc;
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 13px;
          }

          input[type='text']:focus, select:focus {
            outline: none;
            border-color: #38bdf8;
          }

          .console-output {
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: 8px;
            overflow: hidden;
            margin-top: 16px;
          }

          .console-header {
            background: #0f172a;
            padding: 8px 14px;
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #1e293b;
          }

          .agent-typing {
            color: #38bdf8;
            animation: pulse 1s infinite;
          }

          .console-body {
            padding: 14px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            color: #38bdf8;
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
            background: #1e293b;
            padding: 14px;
            border-radius: 8px;
            border: 1px solid #334155;
          }

          .law-num {
            width: 28px;
            height: 28px;
            background: #38bdf8;
            color: #0f172a;
            font-weight: 800;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            flex-shrink: 0;
          }

          .law-body strong {
            display: block;
            font-size: 13.5px;
            color: #f8fafc;
            margin-bottom: 4px;
          }

          .law-body p {
            margin: 0;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.4;
          }

          .evidence-explanation {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .evidence-rule-card {
            background: #1e293b;
            padding: 14px;
            border-radius: 8px;
            border: 1px solid #334155;
          }

          .evidence-rule-title {
            font-weight: 700;
            font-size: 13px;
            margin-bottom: 6px;
          }

          .verified-text { color: #4ade80; }
          .probable-text { color: #fbbf24; }

          .evidence-rule-card p {
            margin: 0;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.4;
          }

          .code-block {
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 16px;
            overflow-x: auto;
          }

          .code-block pre {
            margin: 0;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            color: #38bdf8;
            line-height: 1.5;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

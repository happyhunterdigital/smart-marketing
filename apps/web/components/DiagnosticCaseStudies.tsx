import React from "react";

interface AuditCaseStudy {
  id: string;
  client: string;
  industry: string;
  tag: string;
  baseline: string;
  execution: string;
  proof: string;
  metricLabel: string;
  metricValue: string;
}

const CASE_STUDIES: AuditCaseStudy[] = [
  {
    id: "stellenbosch-hospitality",
    client: "The Harvest Table",
    industry: "Hospitality & Local Enterprise",
    tag: "Entity Architecture & Audit",
    baseline: "Client suffered from 4.2-second load time, leading to a 38% mobile drop-off rate and conflicting Google Maps NAP listings across 3 directory indices.",
    execution: "Migrated to Next.js SSG with zero-layout-shift image CDNs, connected Meta Cloud API WhatsApp bot with automated reservations, and aligned 50+ NAP audit fields.",
    proof: "Google Local 3-Pack rank rose from position 14 to #2 in 45 days. WhatsApp direct bookings increased +64%, yielding 112 new monthly verified diners.",
    metricLabel: "Direct Booking Lift",
    metricValue: "+64%",
  },
  {
    id: "cape-b2b-saas",
    client: "Hypergrowth Logistics",
    industry: "B2B Supply Chain SaaS",
    tag: "Agentic CRM & Outbound",
    baseline: "Sales reps spent 18 hours/week manually copy-pasting lead research from LinkedIn into stale CRM records with 22% hallucinated contact emails.",
    execution: "Deployed Eve durable autonomous research agent on NestJS tRPC pipeline with FOR UPDATE SKIP LOCKED queues, evidence ledger verification, and deny-all sandbox egress.",
    proof: "Zero human research time needed. 1,482 verified primary facts committed to ledger, outbound meeting conversion jumped from 3.1% to 8.4%.",
    metricLabel: "Meeting Conversion",
    metricValue: "2.7x",
  },
  {
    id: "retail-commerce",
    client: "Vanguard Artisan Goods",
    industry: "Direct-to-Consumer Commerce",
    tag: "Performance & DM Conversion",
    baseline: "High Instagram ad spend with 82% abandonment when directing users to a slow multi-step web checkout requiring manual account creation.",
    execution: "Installed OpenReply comment-to-DM automation with instant follow-gating, BullMQ background queues, and one-tap checkout link generation inside Instagram DMs.",
    proof: "Cost per acquisition plunged -46%. Instagram post comment-to-purchase velocity compressed from 48 hours to under 3 minutes.",
    metricLabel: "CPA Reduction",
    metricValue: "-46%",
  },
];

export default function DiagnosticCaseStudies(): React.JSX.Element {
  return (
    <div className="case-studies">
      {CASE_STUDIES.map((study) => (
        <article key={study.id} className="case-card">
          <div className="case-top">
            <span className="case-tag">{study.tag}</span>
            <span className="case-metric">
              <span className="case-metric-value">{study.metricValue}</span>
              <span className="case-metric-label">{study.metricLabel}</span>
            </span>
          </div>

          <div className="case-header">
            <h3 className="case-client">{study.client}</h3>
            <span className="case-industry">{study.industry}</span>
          </div>

          <div className="case-sections">
            <div className="case-section">
              <span className="case-section-label">Baseline problem</span>
              <p>{study.baseline}</p>
            </div>
            <div className="case-section">
              <span className="case-section-label">Execution</span>
              <p>{study.execution}</p>
            </div>
            <div className="case-section">
              <span className="case-section-label">Proof</span>
              <p>{study.proof}</p>
            </div>
          </div>
        </article>
      ))}

      <style jsx>{`
        .case-studies {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .case-card {
          background: rgba(255,255,255,0.02);
          border-radius: 20px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          transition: background 0.3s ease;
        }
        .case-card:hover {
          background: rgba(255,255,255,0.035);
        }
        .case-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .case-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #52525b;
        }
        .case-metric {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .case-metric-value {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .case-metric-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3f3f46;
        }
        .case-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .case-client {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .case-industry {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #3f3f46;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .case-sections {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .case-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .case-section-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #3f3f46;
        }
        .case-section p {
          font-size: 14px;
          line-height: 1.7;
          color: #a1a1aa;
          margin: 0;
        }

        @media (max-width: 834px) {
          .case-card { padding: 28px; }
          .case-top { flex-direction: column; gap: 12px; }
          .case-metric { align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

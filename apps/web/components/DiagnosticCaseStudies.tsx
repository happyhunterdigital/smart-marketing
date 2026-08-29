import React from "react";
import SpotlightCard from "./SpotlightCard";
import { AlertCircle, Code2, LineChart, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {CASE_STUDIES.map((study) => (
          <SpotlightCard key={study.id} className="h-full flex flex-col justify-between">
            <div>
              {/* Header meta */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4 mb-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-amber-500">
                  {study.tag}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-zinc-400">
                  DIAGNOSTIC
                </span>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-bold text-white font-display">{study.client}</h4>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{study.industry}</p>
              </div>

              {/* Three Distinct Diagnostic Pillars */}
              <div className="space-y-4">
                {/* Pillar 1: Baseline */}
                <div className="rounded-xl border border-red-500/15 bg-red-950/10 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 mb-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>1. The Baseline Problem</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {study.baseline}
                  </p>
                </div>

                {/* Pillar 2: Execution */}
                <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    <Code2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>2. The Dev Execution</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300 font-mono">
                    {study.execution}
                  </p>
                </div>

                {/* Pillar 3: Marketing Proof */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    <LineChart className="h-3.5 w-3.5" />
                    <span>3. The Marketing Proof</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-200">
                    {study.proof}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Outcome Metric */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  {study.metricLabel}
                </span>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {study.metricValue}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verified in Prod</span>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}

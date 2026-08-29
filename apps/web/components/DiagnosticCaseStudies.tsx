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
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {CASE_STUDIES.map((study) => (
          <SpotlightCard key={study.id} className="h-full flex flex-col justify-between !p-8">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-5 mb-6">
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-amber-500">
                  {study.tag}
                </span>
                <span className="text-[9px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-500">
                  DIAGNOSTIC
                </span>
              </div>

              <div className="mb-6">
                <h4 className="text-[17px] font-bold text-white tracking-tight" style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}>{study.client}</h4>
                <p className="text-[11px] text-zinc-500 font-mono mt-1 tracking-wide uppercase">{study.industry}</p>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-zinc-500 mb-2">
                    <AlertCircle className="h-3.5 w-3.5 text-zinc-500" />
                    <span>01 · Baseline Problem</span>
                  </div>
                  <p className="text-[12.5px] leading-[1.65] text-zinc-300">
                    {study.baseline}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.04] p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-amber-500/80 mb-2">
                    <Code2 className="h-3.5 w-3.5" />
                    <span>02 · Dev Execution</span>
                  </div>
                  <p className="text-[12.5px] leading-[1.65] text-zinc-300">
                    {study.execution}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.06] p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-emerald-400 mb-2">
                    <LineChart className="h-3.5 w-3.5" />
                    <span>03 · Marketing Proof</span>
                  </div>
                  <p className="text-[12.5px] leading-[1.65] text-zinc-200">
                    {study.proof}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-500">
                  {study.metricLabel}
                </span>
                <div className="text-[26px] font-black tracking-tight text-white mt-0.5" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                  <span className="text-amber-500">{study.metricValue}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Verified</span>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}

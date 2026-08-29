"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, TrendingUp, Cpu, DollarSign, Zap } from "lucide-react";
import Link from "next/link";

export default function RoiCalculator(): React.JSX.Element {
  const [traffic, setTraffic] = useState<number>(25000);
  const [conversionRate, setConversionRate] = useState<number>(1.6);
  const [orderValue, setOrderValue] = useState<number>(180);

  const [currentRevenue, setCurrentRevenue] = useState<number>(0);
  const [projectedRevenue, setProjectedRevenue] = useState<number>(0);

  useEffect(() => {
    // Current state standard benchmarks
    const currentRev = (traffic * (conversionRate / 100)) * orderValue;
    setCurrentRevenue(currentRev);

    // Projected baseline after entity-first speed & marketing automation (+0.8% CVR lift, +10% AOV)
    const projectedRev = (traffic * ((conversionRate + 0.8) / 100)) * (orderValue * 1.1);
    setProjectedRevenue(projectedRev);
  }, [traffic, conversionRate, orderValue]);

  const monthlyLift = Math.max(0, projectedRevenue - currentRevenue);
  const annualLift = monthlyLift * 12;

  return (
    <div className="w-full rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-500">
            <Zap className="h-3.5 w-3.5" />
            <span>Interactive Marketing Component · 2026</span>
          </div>
          <h3 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Simulated Performance Estimator
          </h3>
          <p className="mt-1.5 text-sm text-zinc-400 max-w-xl">
            Model the financial impact of sub-100ms load times, automated WhatsApp/IG lead capture, and zero-hallucination CRM data.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-mono font-bold text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Realtime Projection</span>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Sliders Control Panel */}
        <div className="space-y-7 lg:col-span-7">
          <div className="rounded-xl border border-white/5 bg-zinc-950/70 p-5">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-amber-500" /> Monthly Unique Traffic
              </label>
              <span className="text-base font-mono font-extrabold text-white px-2.5 py-0.5 rounded bg-zinc-900 border border-white/10">
                {traffic.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">visits/mo</span>
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="250000"
              step="5000"
              value={traffic}
              onChange={(e) => setTraffic(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="mt-2 flex justify-between text-[11px] font-mono text-zinc-500">
              <span>5k</span>
              <span>125k</span>
              <span>250k</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-zinc-950/70 p-5">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" /> Current Conversion Rate (CVR)
              </label>
              <span className="text-base font-mono font-extrabold text-white px-2.5 py-0.5 rounded bg-zinc-900 border border-white/10">
                {conversionRate.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="6.0"
              step="0.1"
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="mt-2 flex justify-between text-[11px] font-mono text-zinc-500">
              <span>0.4%</span>
              <span>3.0% (Average)</span>
              <span>6.0%</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-zinc-950/70 p-5">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-500" /> Average Value per Order / Lead ($ / R)
              </label>
              <span className="text-base font-mono font-extrabold text-white px-2.5 py-0.5 rounded bg-zinc-900 border border-white/10">
                ${orderValue}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="1500"
              step="10"
              value={orderValue}
              onChange={(e) => setOrderValue(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="mt-2 flex justify-between text-[11px] font-mono text-zinc-500">
              <span>$30</span>
              <span>$750</span>
              <span>$1,500</span>
            </div>
          </div>
        </div>

        {/* Output Metrics Panel */}
        <div className="flex flex-col justify-between rounded-2xl bg-zinc-950 p-6 md:p-8 lg:col-span-5 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400">
              Estimated Monthly Lift
            </span>
            <div className="mt-2 text-4xl md:text-5xl font-black tracking-tight text-amber-400 font-mono">
              +${monthlyLift.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="text-base font-normal text-zinc-500 ml-2">/mo</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-zinc-900/60 p-3.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Annual Run-Rate Lift</span>
                <p className="text-base font-mono font-bold text-white mt-0.5">
                  +${annualLift.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Target CVR Lift</span>
                <p className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                  +0.8% <span className="text-xs text-zinc-400 font-normal">(+{((0.8/conversionRate)*100).toFixed(0)}%)</span>
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
              By re-engineering your page architecture for sub-100ms static speed and activating autonomous WhatsApp/CRM lead-capture pipelines, we target a baseline +0.8% conversion lift with zero additional ad spend.
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="/dashboard/gmaps-scraper"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-black hover:bg-amber-400 transition-all active:scale-[0.98] shadow-[0_0_25px_rgba(251,191,36,0.25)]"
            >
              <span>Audit My Funnel Free</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <span className="text-[10px] font-mono text-zinc-500 text-center uppercase tracking-wider">
              No credit card required · 50+ data fields verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

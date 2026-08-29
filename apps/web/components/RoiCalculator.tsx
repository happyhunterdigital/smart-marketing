"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function RoiCalculator(): React.JSX.Element {
  const [traffic, setTraffic] = useState<number>(10000);
  const [conversionRate, setConversionRate] = useState<number>(1.3);
  const [orderValue, setOrderValue] = useState<number>(180);

  const [currentRevenue, setCurrentRevenue] = useState<number>(0);
  const [projectedRevenue, setProjectedRevenue] = useState<number>(0);

  useEffect(() => {
    const currentRev = (traffic * (conversionRate / 100)) * orderValue;
    setCurrentRevenue(currentRev);
    const projectedRev = (traffic * ((conversionRate + 0.8) / 100)) * (orderValue * 1.1);
    setProjectedRevenue(projectedRev);
  }, [traffic, conversionRate, orderValue]);

  const lift = Math.max(0, projectedRevenue - currentRevenue);
  const annual = lift * 12;
  const cvrLiftPct = conversionRate > 0 ? ((0.8 / conversionRate) * 100).toFixed(0) : "0";

  const pct = (val: number, min: number, max: number) => ((val - min) / (max - min)) * 100;

  return (
    <div className="w-full rounded-xl border border-[#222] bg-[#0a0a0c] p-1 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 border border-white/[0.04] rounded-xl pointer-events-none" />
      <div className="p-8 sm:p-12 relative z-10">
        <header className="mb-10">
          <h3 className="text-3xl font-extrabold text-white mb-2 flex flex-wrap items-baseline gap-2" style={{ fontFamily: 'Clash Display, Inter, sans-serif' }}>
            Professional Performance Estimator <span className="text-zinc-500 text-xl font-medium">v1</span>
          </h3>
          <p className="text-zinc-400 text-sm">Showcase digital marketing authority and calculate projected revenue lift.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Sliders */}
          <div className="flex flex-col gap-4 relative">
            {/* Slider 1 */}
            <div className="rounded-xl p-6 relative" style={{ background: 'rgba(25,25,30,0.7)', border: '1px solid rgba(226,255,0,0.3)', boxShadow: '0 0 15px rgba(226,255,0,0.15) inset' }}>
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Monthly Unique Traffic</label>
                <div className="text-right text-white">
                  <span className="text-3xl font-bold">{traffic.toLocaleString()}</span>
                  <span className="text-zinc-400 text-sm ml-1">visits/mo</span>
                </div>
              </div>
              <div className="relative mb-2" style={{ height: 4 }}>
                <div className="absolute inset-0 rounded" style={{ background: '#333' }} />
                <div className="absolute top-0 left-0 h-1 rounded shadow-[0_0_10px_rgba(226,255,0,0.5)]" style={{ width: `${pct(traffic, 5000, 250000)}%`, background: '#e2ff00' }} />
                <input aria-label="Monthly Unique Traffic" max={250000} min={5000} type="range" value={traffic} onChange={(e) => setTraffic(Number(e.target.value))} className="absolute inset-0 w-full h-1 bg-transparent appearance-none cursor-pointer" style={{ accentColor: '#e2ff00' }} />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                <span>5k</span><span>250k</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(25,25,30,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Current Conversion Rate (CVR)</label>
                <div className="text-right text-white">
                  <span className="text-3xl font-bold">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="relative mb-2" style={{ height: 4 }}>
                <div className="absolute inset-0 rounded" style={{ background: '#333' }} />
                <div className="absolute top-0 left-0 h-1 rounded shadow-[0_0_10px_rgba(226,255,0,0.5)]" style={{ width: `${pct(conversionRate, 0.4, 6.0)}%`, background: '#e2ff00' }} />
                <input aria-label="Current Conversion Rate" max={6.0} min={0.4} step={0.1} type="range" value={conversionRate} onChange={(e) => setConversionRate(Number(e.target.value))} className="absolute inset-0 w-full h-1 bg-transparent appearance-none cursor-pointer" style={{ accentColor: '#e2ff00' }} />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                <span>0.4%</span><span>6.0%</span>
              </div>
            </div>

            {/* Slider 3 */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(25,25,30,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Average Value Per Order / Lead ($ / R)</label>
                <div className="text-right text-white">
                  <span className="text-3xl font-bold">${orderValue}</span>
                </div>
              </div>
              <div className="relative mb-2" style={{ height: 4 }}>
                <div className="absolute inset-0 rounded" style={{ background: '#333' }} />
                <div className="absolute top-0 left-0 h-1 rounded shadow-[0_0_10px_rgba(226,255,0,0.5)]" style={{ width: `${pct(orderValue, 30, 1500)}%`, background: '#e2ff00' }} />
                <input aria-label="Average Value Per Order" max={1500} min={30} type="range" value={orderValue} onChange={(e) => setOrderValue(Number(e.target.value))} className="absolute inset-0 w-full h-1 bg-transparent appearance-none cursor-pointer" style={{ accentColor: '#e2ff00' }} />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                <span>$30</span><span>$1,500</span>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="flex flex-col justify-center relative">
            <svg className="hidden lg:block absolute -left-10 top-1/2 -translate-y-1/2" width="40" height="300" viewBox="0 0 40 300" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,50 L20,50 L20,150 L40,150" stroke="rgba(226,255,0,0.5)" strokeWidth="1.5" fill="none" />
              <path d="M0,150 L10,150 L10,170 L40,170" stroke="rgba(226,255,0,0.5)" strokeWidth="1.5" fill="none" />
              <path d="M0,250 L20,250 L20,190 L40,190" stroke="rgba(226,255,0,0.5)" strokeWidth="1.5" fill="none" />
              <circle cx="0" cy="50" r="2" fill="rgba(226,255,0,0.8)" />
              <circle cx="0" cy="150" r="2" fill="rgba(226,255,0,0.8)" />
              <circle cx="0" cy="250" r="2" fill="rgba(226,255,0,0.8)" />
              <circle cx="40" cy="150" r="2" fill="rgba(226,255,0,0.8)" />
              <circle cx="40" cy="170" r="2" fill="rgba(226,255,0,0.8)" />
              <circle cx="40" cy="190" r="2" fill="rgba(226,255,0,0.8)" />
            </svg>

            <div className="pl-0 lg:pl-10">
              <div className="mb-6 flex items-baseline">
                <span className="text-6xl sm:text-7xl font-bold" style={{ color: '#e2ff00', textShadow: '0 0 10px rgba(226,255,0,0.4), 0 0 20px rgba(226,255,0,0.2)' }}>
                  +${lift.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-2xl font-semibold ml-2" style={{ color: '#e2ff00', opacity: 0.8 }}>/mo</span>
              </div>

              <div className="mb-6 space-y-1">
                <p className="text-xs tracking-wider font-semibold">
                  <span className="text-zinc-400">ANNUAL RUN-RATE LIFT: </span>
                  <span className="text-white">+${annual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </p>
                <p className="text-xs tracking-wider font-semibold">
                  <span className="text-zinc-400">TARGET CVR LIFT: </span>
                  <span className="text-white">+0.8% (+{cvrLiftPct}%)</span>
                </p>
              </div>

              <p className="text-zinc-300 text-sm leading-loose mb-8 max-w-sm">
                By re-engineering your page architecture for sub-100ms static speed and activating autonomous WhatsApp/CRM lead-capture pipelines, we target a baseline +0.8% conversion lift.
              </p>

              <div className="flex flex-col items-center sm:items-start">
                <Link href="/dashboard/gmaps-scraper" className="font-bold text-lg py-4 px-8 rounded-lg w-full sm:w-auto flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(226,255,0,0.3)] hover:brightness-110 transition" style={{ background: '#e2ff00', color: '#000' }}>
                  AUDIT MY FUNNEL FREE
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold text-center w-full sm:w-auto mt-4">
                  No credit card required ✦ 50+ data fields verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

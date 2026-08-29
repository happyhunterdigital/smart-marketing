import { useEffect, useState } from 'react';
import Link from 'next/link';
import { firebaseAuth } from '../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import RoiCalculator from '../components/RoiCalculator';
import DiagnosticCaseStudies from '../components/DiagnosticCaseStudies';
import { ArrowDown, Zap, Shield, Activity, BarChart3, Terminal } from 'lucide-react';

// Blueprint: Editorial / Brutalist Hybrid — 2026
// Structural geometry, crisp typography (Clash Display / Syne display + JetBrains Mono), tactile 1px borders, ROI estimator, diagnostic case studies.

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      if (u) setUser(u);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="page">
      <div className="ambient" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* ASCII WIREFRAME STRUCTURAL HEADER BAR */}
      <div className="utility-bar">
        <div className="utility-inner">
          <span className="mono-label">+--- [CAPE TOWN · EST. 2024] ---------------------------------------------------+</span>
          <span className="mono-label hide-md">DEVELOPMENT & MARKETING ARCHITECTURE</span>
          <span className="mono-label">LATENCY: &lt;100MS · EDGE STATIC ---+</span>
        </div>
      </div>

      {/* NAV — 1px border, crisp, 64px */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1780206015/favicon_jafn1r.jpg" alt="" width={28} height={28} style={{ borderRadius: 7, display: 'block' }} />
            </span>
            <span className="brand-word">
              <span className="w-name"><span className="w-happy">happy</span><span className="w-hunter">hunter</span><span className="w-digital">digital</span></span>
              <span className="w-sub">Smart Marketing</span>
            </span>
          </Link>

          <div className="nav-links">
            <a href="#work" className="nav-link"><span className="nav-mono">01</span> Work</a>
            <a href="#calculator" className="nav-link"><span className="nav-mono">02</span> Estimator</a>
            <a href="#tools" className="nav-link"><span className="nav-mono">03</span> Tools</a>
            <Link href="/dashboard/billing" className="nav-link"><span className="nav-mono">04</span> Pricing</Link>
          </div>

          <div className="nav-cta">
            {checkingAuth ? <span className="nav-loading" /> : user ? (
              <Link href="/dashboard" className="btn btn-amber btn-sm">Open dashboard →</Link>
            ) : (
              <>
                <Link href="/login" className="nav-link hide-sm">Sign in</Link>
                <Link href="/login?register=true" className="btn btn-amber btn-sm">Launch workspace →</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO — Hybrid Value Proposition: "WE ENGINEER HIGH-CONVERSION WEBSITES. Then we drive the traffic that scales them." */}
      <header className="hero">
        <div className="hero-grid">
          {/* LEFT — headline block */}
          <div className="hero-copy">
            <div className="kicker">
              <span className="kicker-rule" aria-hidden="true" />
              <span className="mono-label">THE HYBRID VALUE PROPOSITION · 2026</span>
            </div>

            <h1 className="hero-h1">
              WE ENGINEER <span className="hero-ink">HIGH-CONVERSION</span> WEBSITES.
              <br />
              <span className="hero-subline">Then we drive the traffic that scales them.</span>
            </h1>

            <div className="hero-utility">
              <div className="utility-col">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Development</span>
                </div>
                <p>Evidence ledger, deny-all sandbox, Next.js SSG architectures.</p>
              </div>
              <div className="utility-divider" aria-hidden="true" />
              <div className="utility-col">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Marketing</span>
                </div>
                <p>50+ field audits, Meta WhatsApp + IG bots, verified trust signals.</p>
              </div>
            </div>

            <p className="hero-sub">
              If an AI cannot verify your entity exists, your traffic converts to zero. We make you verifiable, load in &lt;100ms, and turn signals into revenue.
            </p>

            <div className="hero-actions">
              <a href="#work" className="btn btn-amber btn-lg">
                View Our Proof <ArrowDown className="h-4 w-4" />
              </a>
              <Link href={user ? '/dashboard' : '/login?register=true'} className="btn btn-ghost btn-lg">
                Launch Free Workspace →
              </Link>
            </div>

            <div className="hero-meta proof-strip">
              <span><b>100%</b> Core Web Vitals</span><i>—</i>
              <span><b>&lt;100ms</b> TTFB</span><i>—</i>
              <span><b>1,482</b> Ledger Facts</span><i>—</i>
              <span><b>Zero</b> Bloat</span>
            </div>
          </div>

          {/* RIGHT — tactile proof ledger */}
          <div className="hero-visual">
            <div className="bezel">
              <div className="bezel-inner">
                <div className="win-bar">
                  <span className="win-dots"><i /><i /><i /></span>
                  <span className="win-title">Business Auditor — live preview</span>
                  <span className="win-badge">● Live</span>
                </div>

                <div className="preview-card">
                  <div className="pc-top">
                    <div className="pc-icon">◉</div>
                    <div>
                      <div className="pc-name">The Harvest Table · Stellenbosch</div>
                      <div className="pc-sub">Category · Address · Phone · Website · Ratings</div>
                    </div>
                    <span className="pc-score">84<span>/100</span></span>
                  </div>
                  <div className="pc-rows">
                    {[
                      { k: 'Google listing', v: 'Verified — 4.7 ★ (312)', ok: true },
                      { k: 'NAP consistency', v: '2 mismatches — phone, hours', ok: false },
                      { k: 'Evidence ledger', v: '6 facts · 3 sources', ok: true },
                    ].map(r=> (
                      <div key={r.k} className={`pc-row ${r.ok ? 'ok' : 'warn'}`}>
                        <span className="pc-k">{r.k}</span>
                        <span className="pc-v">{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pc-foot">
                    <span>50+ fields checked</span>
                    <span className="pc-cta">Run audit →</span>
                  </div>
                </div>

                <div className="ledger">
                  <div className="ledger-head">
                    <span>Evidence ledger</span>
                    <span className="ledger-tag">VERIFIED</span>
                  </div>
                  <div className="ledger-line"><span className="mono">fact · phone</span><span>+27 21 888 0100</span><span className="tag-v">VERIFIED</span></div>
                  <div className="ledger-line"><span className="mono">fact · website</span><span>harvesttable.co.za</span><span className="tag-v">VERIFIED</span></div>
                  <div className="ledger-line"><span className="mono">fact · hours</span><span>Mon–Sat 07:00–21:00</span><span className="tag-p">PROBABLE</span></div>
                </div>

                <div className="preview-img">
                  <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787938869/happyhunterdigital_smart_marketing_Digital_brain_with_marketing_icons_202608281925_t1yzqq.jpg" alt="Digital brain with marketing icons — Happy Hunter Digital" loading="eager" />
                  <div className="preview-img-scrim" />
                  <span className="preview-img-label">Digital brain · entity-first · every signal is verifiable</span>
                </div>
              </div>
            </div>
            <div className="hero-caption">Forensic view — the hunter reads tracks. Nothing is random.</div>
          </div>
        </div>
      </header>

      {/* MARQUEE — 1px borders, tactile */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>DATA SOVEREIGNTY</span><i>◆</i>
          <span>MATHEMATICAL CERTAINTY</span><i>◆</i>
          <span>VERIFIED TRUST</span><i>◆</i>
          <span>AUTONOMOUS AGENTS</span><i>◆</i>
          <span>ENTITY-FIRST MARKETING</span><i>◆</i>
          <span>DATA SOVEREIGNTY</span><i>◆</i>
          <span>MATHEMATICAL CERTAINTY</span><i>◆</i>
          <span>VERIFIED TRUST</span><i>◆</i>
          <span>AUTONOMOUS AGENTS</span><i>◆</i>
          <span>ENTITY-FIRST MARKETING</span><i>◆</i>
        </div>
      </div>

      {/* SECTION: CONVERSION ESTIMATOR (ROI CALCULATOR) */}
      <section id="calculator" className="section">
        <div className="section-head editorial-head">
          <div className="head-rule" aria-hidden="true" />
          <div>
            <span className="mono-label">01 — CONVERSION AUTHORITY</span>
            <h2>Interactive Performance Estimator</h2>
            <p>Showcase digital marketing authority on the canvas. Calculate projected revenue lift when moving to entity-first architecture.</p>
          </div>
        </div>

        <RoiCalculator />
      </section>

      {/* SECTION: DEVELOPMENT PROOF (CASE STUDIES BUILT LIKE AUDITS) */}
      <section id="work" className="section section-alt">
        <div className="section-head editorial-head">
          <div className="head-rule" aria-hidden="true" />
          <div>
            <span className="mono-label">02 — THE DEVELOPMENT PROOF</span>
            <h2>Case Studies Built Like Engineering Audits</h2>
            <p>No vague agency screenshots. Every portfolio project structured into 3 distinct pillars: Baseline Problem, Dev Execution, and Marketing Proof.</p>
          </div>
        </div>

        <DiagnosticCaseStudies />
      </section>

      {/* SECTION: SPECIFIC INTERACTIVE SUITE */}
      <section id="tools" className="section">
        <div className="section-head editorial-head">
          <div className="head-rule" aria-hidden="true" />
          <div>
            <span className="mono-label">03 — THE SUITE</span>
            <h2>One platform. Six hunters.</h2>
            <p>Specific interactive execution blocks — live endpoints, background queues, and verified ledger facts.</p>
          </div>
          <span className="mono-label head-count">06 BLOCKS</span>
        </div>

        <div className="bento">
          <Link href="/dashboard/crm" className="cell cell-featured cell-clickable">
            <div className="cell-img">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941986/happyhunterdigital_smart_marketing_Website_card_showcasing_CRM_ead3lc.jpg" alt="Happy Hunter CRM — website card showcasing CRM" loading="lazy" />
              <div className="cell-scrim" />
              <span className="cell-code">tRPC · Eve · ledger:1,482 facts</span>
            </div>
            <div className="cell-body">
              <span className="pill pill-amber">Agentic first — Eve</span>
              <h3>Happy Hunter CRM</h3>
              <p>The CRM is where the agent keeps its notes. Durable Eve agents, evidence-first ledger, mailbox sync. Zero hallucinations.</p>
              <div className="cell-tags"><span>Eve durable agents</span><span>Evidence ledger</span><span>Mailbox sync</span></div>
              <span className="cell-link">Open CRM Control Center →</span>
            </div>
          </Link>

          <Link href="/dashboard/gmaps-scraper" className="cell cell-image cell-clickable">
            <div className="cell-img sm">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941987/happyhunterdigital_smart_marketing_Google_Maps_business_auditor_kqssi2.jpg" alt="Google Maps Business Auditor — website card" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body sm">
              <span className="pill pill-live">● Live tool</span>
              <h3>Google Maps Business Auditor</h3>
              <p>Audit name, category, address, phone, website, ratings. 50+ fields to find red flags before customers do.</p>
              <div className="cell-tags"><span>Botasaurus</span><span>50+ fields</span></div>
              <span className="cell-link">Run audit →</span>
            </div>
          </Link>

          <Link href="/dashboard/crm" className="cell cell-dark cell-clickable">
            <span className="pill" style={{ background:'#7c3aed', color:'#fff', border:'none' }}>Eve Queue · Dispatch</span>
            <h3>Eve Agent Queue</h3>
            <p>Leads land as <span className="mono-inline">AgentTask</span> rows. Eve drains with <span className="mono-inline">FOR UPDATE SKIP LOCKED</span> and commits <span className="mono-inline">VERIFIED</span> vs <span className="mono-inline">PROBABLE</span>.</p>
            <div className="inline-terminal">
              <span>SELECT * FROM agent_task WHERE status=`pending` FOR UPDATE SKIP LOCKED LIMIT 1;</span>
            </div>
            <span className="cell-link">Open Agent Queue →</span>
          </Link>

          <Link href="/dashboard/whatsapp" className="cell cell-image cell-clickable">
            <div className="cell-img sm">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941987/happyhunterdigital_smart_marketing_Website_card_design_for_WhatsAppBot_op9wpe.jpg" alt="WhatsApp Bot — website card design" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body sm">
              <span className="pill" style={{ background:'rgba(37,211,102,0.14)', color:'#25D366', borderColor:'rgba(37,211,102,0.25)' }}>● Live — Meta Cloud API</span>
              <h3>WhatsApp Bot — Official</h3>
              <p>Interactive buttons, guided lead flow, AI replies from <span className="mono-inline">servicesKnowledge</span>.</p>
              <span className="cell-link" style={{ color:'#25D366' }}>Open WhatsApp Control →</span>
            </div>
          </Link>

          <Link href="/dashboard/jobs" className="cell cell-image cell-clickable">
            <div className="cell-img sm">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941987/happyhunterdigital_smart_marketing_Website_card_design_for_InstagramDM_ick4fw.jpg" alt="OpenReply Instagram DM — website card design" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body sm">
              <span className="pill pill-muted">Ready to deploy</span>
              <h3>OpenReply — Instagram DM</h3>
              <p>Keyword on comments/reels → tracked link DMs, follow-gating, BullMQ.</p>
              <div className="cell-tags"><span>Meta Graph API</span><span>BullMQ</span></div>
              <span className="cell-link">View queue →</span>
            </div>
          </Link>

          <Link href="/dashboard/jobs" className="cell cell-clickable">
            <span className="pill pill-muted">Soon</span>
            <h3>Social Analyzer + OpenMontage</h3>
            <p>OSINT across 1000+ networks plus agent-first video pipeline. Footprint, then footage.</p>
            <div className="cell-tags"><span>OSINT</span><span>Remotion</span><span>Whisper</span></div>
            <span className="cell-link">Explore →</span>
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta">
        <div className="cta-card">
          <p className="mono-label" style={{ justifyContent: 'center', display:'flex', alignItems:'center', gap:'8px' }}><span className="dot" />Ready when you are</p>
          <h2>Start hunting. Free workspace.</h2>
          <p>Spin up the auditor and CRM in minutes. Upgrade only when you need more searches, agents, or channels.</p>
          <div className="cta-actions">
            <Link href={user ? '/dashboard' : '/login?register=true'} className="btn btn-amber btn-lg">Launch workspace <span className="btn-arrow">→</span></Link>
            <Link href="/dashboard/billing" className="btn btn-ghost btn-lg">View pricing</Link>
          </div>
          <span className="cta-note">No jargon, no obligation. Same workspace for audit, CRM, and messaging.</span>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="f-line"><span className="f-happy">happy</span><span className="f-hunter">hunter</span><span className="f-digital">digital</span></span>
            <span className="f-sub">South African Digital Entity Architecture Firm · Entity-first marketing. Agentic revenue systems.</span>
          </div>
          <div className="footer-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/crm">CRM</Link>
            <Link href="/dashboard/gmaps-scraper">Audit</Link>
            <Link href="/dashboard/whatsapp">WhatsApp</Link>
            <Link href="/dashboard/billing">Pricing</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Happy Hunter Digital. Nothing random.</span>
          <span className="footer-meta">Clash Display / JetBrains Mono • 1px borders • Spring 0.35s</span>
        </div>
      </footer>

      <style jsx>{`
        .page { min-height:100vh; background:#050505; color:#FFFFFF; font-family:Inter, sans-serif; display:flex; flex-direction:column; position:relative; overflow-x:hidden; }
        .ambient { position:fixed; inset:-40% -20% auto -20%; height:900px; background:radial-gradient(ellipse 900px 600px at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 62%); pointer-events:none; z-index:0; }
        .grain { position:fixed; inset:0; pointer-events:none; z-index:1; opacity:0.035; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E"); }

        .mono-label { font-family:'JetBrains Mono', ui-monospace, monospace; font-size:10px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#9ca3af; }
        .utility-bar { border-bottom:1px solid #1a1a1a; background:#080808; position:relative; z-index:21; }
        .utility-inner { max-width:1280px; margin:0 auto; padding:8px 24px; display:flex; justify-content:space-between; gap:16px; }
        .utility-inner .mono-label { font-size:9px; color:#6b7280; }

        .nav { position:sticky; top:0; z-index:20; background:rgba(10,10,15,0.96); backdrop-filter:blur(12px); border-bottom:1px solid #1a1a1a; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04); height:64px; display:flex; align-items:center; }
        .nav-inner { max-width:1280px; width:100%; margin:0 auto; padding:0 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .brand { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .brand-mark { width:34px; height:34px; border-radius:8px; overflow:hidden; box-shadow:0 0 18px rgba(251,191,36,0.28); flex-shrink:0; display:flex; align-items:center; justify-content:center; background:#111; border:1px solid #1a1a1a; }
        .brand-word { display:flex; flex-direction:column; line-height:1; }
        .w-name { display:inline-flex; align-items:baseline; font-size:15px; font-weight:800; letter-spacing:-0.02em; line-height:1; white-space:nowrap; font-family:'Clash Display', 'Syne', sans-serif; }
        .w-happy { color:#fff; } .w-hunter { color:#f59e0b; } .w-digital { color:#fff; }
        .w-sub { font-size:9px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280; margin-top:3px; font-family:'JetBrains Mono', monospace; }
        .nav-links { display:flex; align-items:center; gap:18px; }
        .nav-link { font-size:12px; font-weight:600; color:#9ca3af; text-decoration:none; letter-spacing:0.02em; }
        .nav-link:hover { color:#fff; }
        .nav-mono { font-family:'JetBrains Mono', monospace; font-size:10px; color:#52525b; margin-right:4px; }
        .nav-cta { display:flex; align-items:center; gap:10px; }
        .nav-loading { width:18px; height:18px; border:2px solid rgba(255,255,255,0.12); border-top-color:#f59e0b; border-radius:50%; animation:spin 0.7s linear infinite; }
        @keyframes spin{ to{transform:rotate(360deg);} }

        .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:12px; font-weight:800; text-decoration:none; cursor:pointer; transition:all 0.35s cubic-bezier(0.175,0.885,0.32,1.275); border:1px solid transparent; white-space:nowrap; box-shadow:inset 0 1px 0 rgba(255,255,255,0.06); }
        .btn-amber { background:#f59e0b; color:#050505; border-color:#050505; box-shadow:0 0 24px rgba(251,191,36,0.18), inset 0 1px 0 rgba(255,255,255,0.2); text-transform:uppercase; letter-spacing:0.08em; font-size:12px; }
        .btn-amber:hover { background:#fbbf24; box-shadow:0 0 36px rgba(251,191,36,0.28); transform:translateY(-1px); }
        .btn-amber:active { transform:scale(0.98); }
        .btn-ghost { background:transparent; color:#d1d5db; border-color:#1a1a1a; font-weight:700; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04); }
        .btn-ghost:hover { border-color:rgba(245,158,11,0.35); color:#fff; background:rgba(255,255,255,0.02); }
        .btn-sm { padding:9px 16px; border-radius:10px; }
        .btn-lg { padding:13px 22px; border-radius:12px; font-size:13px; }
        .btn-arrow { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:999px; background:#050505; color:#f59e0b; font-size:12px; margin-left:2px; }

        .hero { max-width:1280px; margin:0 auto; width:100%; padding:28px 24px 24px; position:relative; z-index:2; }
        .hero-grid { display:grid; grid-template-columns:7fr 5fr; gap:0; border:1px solid #1a1a1a; border-radius:20px; overflow:hidden; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.4); background:#0a0a0a; }
        .hero-copy { padding:36px; display:flex; flex-direction:column; gap:18px; border-right:1px solid #1a1a1a; }
        .kicker { display:flex; align-items:center; gap:12px; }
        .kicker-rule { width:28px; height:1px; background:#f59e0b; display:block; }
        .hero-h1 { font-family:'Clash Display','Syne',sans-serif; font-size:clamp(32px,4.5vw,56px); font-weight:700; line-height:0.96; letter-spacing:-0.035em; color:#fff; margin:0; }
        .hero-ink { color:#f59e0b; }
        .hero-subline { display:block; font-size:clamp(18px,2.2vw,28px); font-weight:600; color:#d4d4d8; margin-top:8px; line-height:1.15; letter-spacing:-0.02em; }
        .hero-utility { display:grid; grid-template-columns:1fr auto 1fr; gap:16px; padding:14px; border:1px solid #1a1a1a; border-radius:12px; background:#050505; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04); }
        .utility-col p { font-size:12px; line-height:1.5; color:#a1a1aa; margin:6px 0 0; }
        .utility-divider { width:1px; background:#1a1a1a; }
        .hero-sub { font-size:14px; line-height:1.6; color:#9ca3af; max-width:540px; margin:0; border-left:2px solid #f59e0b; padding-left:12px; }
        .hero-actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:4px; }
        .proof-strip { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:6px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#52525b; border-top:1px solid #1a1a1a; padding-top:12px; }
        .proof-strip b { color:#f59e0b; font-weight:800; }
        .proof-strip i { font-style:normal; color:#27272a; }

        .hero-visual { padding:14px; background:#050505; display:flex; flex-direction:column; gap:10px; }
        .bezel { padding:6px; border-radius:18px; background:rgba(255,255,255,0.04); border:1px solid #1a1a1a; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04); }
        .bezel-inner { background:#0a0a0a; border-radius:14px; overflow:hidden; border:1px solid #1a1a1a; }
        .win-bar { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 14px; border-bottom:1px solid #1a1a1a; background:#0f0f0f; }
        .win-dots { display:flex; gap:6px; }
        .win-dots i { width:10px; height:10px; border-radius:50%; background:#262626; display:block; border:1px solid #1a1a1a; }
        .win-dots i:first-child { background:#ef4444; } .win-dots i:nth-child(2){background:#f59e0b;} .win-dots i:nth-child(3){background:#22c55e;}
        .win-title { font-family:'JetBrains Mono', monospace; font-size:10px; color:#71717a; letter-spacing:0.08em; text-transform:uppercase; }
        .win-badge { font-size:9px; font-weight:800; color:#22c55e; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2); padding:2px 8px; border-radius:999px; }
        .preview-card { padding:16px; border-bottom:1px solid #1a1a1a; }
        .pc-top { display:flex; gap:12px; align-items:center; }
        .pc-icon { width:32px; height:32px; border-radius:8px; background:rgba(245,158,11,0.12); color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:14px; border:1px solid rgba(245,158,11,0.15); }
        .pc-name { font-size:13px; font-weight:700; color:#fff; font-family:'Clash Display',sans-serif; }
        .pc-sub { font-size:10px; color:#71717a; margin-top:2px; font-family:'JetBrains Mono', monospace; }
        .pc-score { margin-left:auto; font-size:18px; font-weight:800; color:#f59e0b; font-family:'JetBrains Mono', monospace; }
        .pc-score span { font-size:11px; color:#52525b; }
        .pc-rows { margin-top:12px; display:flex; flex-direction:column; gap:6px; }
        .pc-row { display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-radius:8px; border:1px solid #1a1a1a; background:#0a0a0a; font-size:11px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.03); transition:all 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
        .pc-row:hover { transform:translateY(-1px); border-color:rgba(245,158,11,0.2); }
        .pc-k { font-family:'JetBrains Mono', monospace; font-size:9px; letter-spacing:0.08em; text-transform:uppercase; color:#71717a; }
        .pc-v { font-weight:600; color:#e4e4e7; font-size:11px; }
        .pc-foot { display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:10px; color:#52525b; font-family:'JetBrains Mono', monospace; text-transform:uppercase; letter-spacing:0.08em; }
        .pc-cta { color:#f59e0b; font-weight:800; }
        .ledger { margin:0 14px 14px; background:#0a0a0a; border:1px solid #1a1a1a; border-radius:10px; padding:10px 12px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.03); }
        .ledger-head { display:flex; justify-content:space-between; align-items:center; font-size:9px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:#71717a; margin-bottom:8px; font-family:'JetBrains Mono', monospace; }
        .ledger-tag { background:#f59e0b; color:#000; padding:2px 6px; border-radius:4px; font-size:8px; letter-spacing:0.1em; }
        .ledger-line { display:flex; gap:8px; align-items:center; font-size:11px; padding:5px 0; border-top:1px solid #1a1a1a; }
        .mono { font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#71717a; }
        .mono-inline { font-family:'JetBrains Mono', monospace; font-size:10px; background:#18181b; border:1px solid #1a1a1a; padding:1px 5px; border-radius:4px; color:#a1a1aa; }
        .tag-v { margin-left:auto; font-size:8px; font-weight:800; color:#16a34a; background:rgba(22,163,74,0.12); border:1px solid rgba(22,163,74,0.2); padding:2px 6px; border-radius:4px; }
        .tag-p { margin-left:auto; font-size:8px; font-weight:800; color:#f59e0b; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.2); padding:2px 6px; border-radius:4px; }
        .preview-img { position:relative; height:148px; overflow:hidden; border-top:1px solid #1a1a1a; }
        .preview-img img { width:100%; height:100%; object-fit:cover; opacity:0.95; }
        .preview-img-scrim { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%); pointer-events:none; }
        .preview-img-label { position:absolute; bottom:10px; left:12px; right:12px; font-family:'JetBrains Mono', monospace; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.85); }
        .hero-caption { font-size:10px; color:#52525b; text-align:center; font-family:'JetBrains Mono', monospace; letter-spacing:0.06em; text-transform:uppercase; }

        .marquee { background:#f59e0b; color:#000; overflow:hidden; white-space:nowrap; border-top:1px solid #000; border-bottom:1px solid #000; position:relative; z-index:2; }
        .marquee-track { display:inline-flex; align-items:center; gap:18px; padding:10px 0; animation:marquee 22s linear infinite; font-size:10px; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; font-family:'JetBrains Mono', monospace; }
        .marquee-track i{ font-style:normal; opacity:0.5; }
        @keyframes marquee{ from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .section { max-width:1280px; margin:0 auto; width:100%; padding:96px 24px; position:relative; z-index:2; }
        .section-alt { background:#080808; border-top:1px solid rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.04); max-width:none; padding:96px 0; }
        .section-alt .section-head, .section-alt .steps, .section-alt > div { max-width:1280px; margin-left:auto; margin-right:auto; }
        .editorial-head { display:flex; gap:20px; align-items:flex-start; margin-bottom:56px; }
        .head-rule { width:3px; align-self:stretch; background:#f59e0b; border-radius:1px; min-height:72px; }
        .editorial-head h2 { font-family:'Clash Display','Syne',sans-serif; font-size:32px; font-weight:700; letter-spacing:-0.03em; color:#fff; margin:6px 0 10px; line-height:1.05; }
        .editorial-head p { font-size:14px; line-height:1.7; color:#71717a; margin:0; max-width:640px; }
        .head-count { margin-left:auto; border:1px solid rgba(255,255,255,0.06); padding:8px 14px; border-radius:999px; background:#0a0a0a; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04); font-size:10px; }

        /* — Minimalist bento: air, not 1px crowd — */
        .bento { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; background:transparent; border:none; overflow:visible; }
        .cell { background:#0a0a0a; padding:24px; display:flex; flex-direction:column; gap:14px; position:relative; transition:all 0.35s cubic-bezier(0.175,0.885,0.32,1.275); text-decoration:none; cursor:pointer; border:1px solid rgba(255,255,255,0.06); border-radius:20px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04); }
        .cell:hover { background:#111; transform:translateY(-3px); border-color:rgba(251,191,36,0.15); box-shadow:0 12px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04); }
        .cell-featured { grid-column:span 2; padding:0; gap:0; border-radius:20px; overflow:hidden; }
        .cell-featured .cell-img { height:240px; position:relative; overflow:hidden; border-bottom:1px solid rgba(255,255,255,0.06); }
        .cell-img img { width:100%; height:100%; object-fit:cover; }
        .cell-img.sm { height:160px; border-bottom:1px solid rgba(255,255,255,0.06); }
        .cell-scrim { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%); pointer-events:none; }
        .cell-code { position:absolute; bottom:10px; left:12px; font-family:'JetBrains Mono', monospace; font-size:10px; color:rgba(255,255,255,0.85); background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.08); padding:4px 8px; border-radius:6px; backdrop-filter:blur(6px); }
        .cell-featured .cell-body { padding:24px; }
        .cell-body.sm { padding:20px 24px 24px; }
        .pill { display:inline-flex; align-items:center; font-size:10px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; padding:5px 10px; border-radius:999px; border:1px solid transparent; width:fit-content; font-family:'JetBrains Mono', monospace; }
        .pill-amber { background:#f59e0b; color:#000; }
        .pill-live { background:rgba(245,158,11,0.1); color:#f59e0b; border-color:rgba(245,158,11,0.2); }
        .pill-muted { background:#18181b; color:#71717a; border-color:#27272a; }
        .cell-dark { background:#0a0a0a; border-color:rgba(124,58,237,0.18); }
        .cell-image { padding:0; overflow:hidden; }
        .cell-image .cell-body.sm { padding:20px 24px 24px; }
        .cell h3 { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#fff; margin:0; letter-spacing:-0.02em; line-height:1.2; }
        .cell p { font-size:13px; line-height:1.6; color:#9ca3af; margin:0; flex:1; }
        .cell-tags { display:flex; gap:8px; flex-wrap:wrap; }
        .cell-tags span { font-family:'JetBrains Mono', monospace; font-size:10px; background:#141414; color:#a1a1aa; border:1px solid rgba(255,255,255,0.06); padding:4px 8px; border-radius:999px; }
        .cell-link { font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:700; color:#f59e0b; letter-spacing:0.06em; }
        .inline-terminal { font-family:'JetBrains Mono', monospace; font-size:11px; color:#f59e0b; background:#000; border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:12px 14px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04); }

        .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; background:transparent; border:none; overflow:visible; }
        .step { background:#0a0a0a; padding:28px; display:flex; flex-direction:column; gap:14px; transition:all 0.35s cubic-bezier(0.175,0.885,0.32,1.275); border:1px solid rgba(255,255,255,0.06); border-radius:20px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04); }
        .step:hover { background:#111; transform:translateY(-2px); }
        .step-n { width:40px; height:40px; border-radius:10px; background:#f59e0b; color:#000; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; font-family:'JetBrains Mono', monospace; border:1px solid #000; }
        .step h4 { font-family:'Clash Display',sans-serif; font-size:17px; font-weight:700; color:#fff; margin:0; letter-spacing:-0.02em; }
        .step p { font-size:13px; line-height:1.65; color:#9ca3af; margin:0; }

        .cta { max-width:1280px; margin:0 auto; width:100%; padding:96px 24px 0; position:relative; z-index:2; }
        .cta-card { background:#0a0a0a; border:1px solid rgba(255,255,255,0.06); border-radius:28px; padding:56px 32px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.4); }
        .cta-card h2 { font-family:'Clash Display',sans-serif; font-size:28px; font-weight:700; letter-spacing:-0.03em; color:#fff; margin:0; }
        .cta-card p { font-size:13px; line-height:1.6; color:#71717a; max-width:560px; margin:0; }
        .cta-actions { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:6px; }
        .cta-note { font-family:'JetBrains Mono', monospace; font-size:10px; color:#52525b; letter-spacing:0.06em; text-transform:uppercase; }

        .footer { margin-top:48px; border-top:1px solid #1a1a1a; background:#050505; position:relative; z-index:2; }
        .footer-inner { max-width:1280px; margin:0 auto; padding:28px 24px; display:flex; justify-content:space-between; gap:24px; align-items:flex-start; }
        .f-line { font-family:'Clash Display',sans-serif; font-size:16px; font-weight:700; letter-spacing:-0.02em; }
        .f-happy{color:#fff;} .f-hunter{color:#f59e0b;} .f-digital{color:#71717a;}
        .f-sub { font-family:'JetBrains Mono', monospace; font-size:10px; color:#52525b; margin-top:6px; max-width:520px; line-height:1.5; text-transform:uppercase; letter-spacing:0.06em; }
        .footer-links { display:flex; gap:16px; flex-wrap:wrap; }
        .footer-links a { font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:600; color:#71717a; text-decoration:none; text-transform:uppercase; letter-spacing:0.06em; }
        .footer-links a:hover { color:#f59e0b; }
        .footer-bottom { max-width:1280px; margin:0 auto; padding:14px 24px 24px; display:flex; justify-content:space-between; gap:16px; font-family:'JetBrains Mono', monospace; font-size:10px; color:#52525b; border-top:1px solid #1a1a1a; text-transform:uppercase; letter-spacing:0.06em; }

        /* — Responsive breakpoints (internal, not public) — 480 / 768 / 834 / 1024 / 1440 */
        @media (prefers-reduced-motion: reduce) { .dot, .marquee-track, .nav-loading, .cell { animation:none !important; transition:none !important; transform:none !important; } }
        @media (max-width: 1440px) { .hero, .section, .utility-inner { max-width:1180px; } }
        @media (max-width: 1024px) { .hero-grid { grid-template-columns:6fr 4fr; } .bento{grid-template-columns:repeat(2,1fr);} .steps{grid-template-columns:repeat(2,1fr);} }
        @media (max-width: 834px) { .hero-grid { grid-template-columns:1fr; } .hero-copy{border-right:none; border-bottom:1px solid #1a1a1a;} .bento{grid-template-columns:1fr;} .cell-featured{grid-column:auto;} .steps{grid-template-columns:1fr;} .footer-inner{flex-direction:column;} .nav-links{display:none;} .hide-sm{display:none;} .utility-inner .hide-md{display:none;} }
        @media (max-width: 768px) { .hero{padding:20px 16px 16px;} .section{padding:72px 16px;} .hero-utility{grid-template-columns:1fr; } .utility-divider{display:none;} }
        @media (max-width: 480px) { .hero{padding:16px;} .hero-copy{padding:20px;} .hero-h1{font-size:28px;} .section{padding:64px 16px;} }
      `}</style>
    </div>
  );
}

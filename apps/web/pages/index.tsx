import { useEffect, useState } from 'react';
import Link from 'next/link';
import { firebaseAuth } from '../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Reading this as: B2B SaaS landing for SA SMEs/agencies, with a forensic dark-tech language, leaning toward Tailwind utilities + Cal Sans/Inter/Mono + amber/black system.
// Dials: DESIGN_VARIANCE 8 / MOTION_INTENSITY 6 / VISUAL_DENSITY 4

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
      {/* Ambient */}
      <div className="ambient" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* NAV — 64px, single line, floating blur per BRAND.md §7 */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1780206015/favicon_jafn1r.jpg" alt="" width={28} height={28} style={{ borderRadius: 7, display: 'block' }} />
            </span>
            <span className="brand-word">
              <span className="w-happy">happy</span><span className="w-hunter">hunter</span>
              <span className="w-sub">Smart Marketing</span>
            </span>
          </Link>

          <div className="nav-links">
            <a href="#tools" className="nav-link">Tools</a>
            <a href="#process" className="nav-link">How it works</a>
            <Link href="/dashboard/billing" className="nav-link">Pricing</Link>
            <a href="https://github.com/happyhunterdigital/crm" target="_blank" rel="noopener noreferrer" className="nav-github">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.18 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.54 9.54 0 0 1 12 6.84a9.54 9.54 0 0 1 2.5.34c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.02 10.02 0 0 0 22 12C22 6.48 17.52 2 12 2Z"/></svg>
              GitHub
            </a>
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

      {/* HERO — split 50/50, fits viewport, max 20 words subtext, max 2 line headline */}
      <header className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="dot" />
              Digital entity architecture — South Africa
            </div>

            <h1 className="hero-h1">
              If an AI cannot <span className="grad">verify you,</span>
              <br />
              you don&apos;t exist.
            </h1>

            <p className="hero-sub">
              We make you verifiable. Autonomous audits, CRM with evidence, and multi-channel outreach — one platform.
            </p>

            <div className="hero-actions">
              <Link href={user ? '/dashboard' : '/login?register=true'} className="btn btn-amber btn-lg">
                Launch workspace <span className="btn-arrow">→</span>
              </Link>
              <Link href="/dashboard/crm" className="btn btn-ghost btn-lg">
                Explore Happy Hunter CRM
              </Link>
            </div>

            <div className="hero-meta">
              <span className="mono">Entity-first</span>
              <span className="sep">·</span>
              <span className="mono">Agentic revenue systems</span>
              <span className="sep">·</span>
              <span className="mono">No jargon</span>
            </div>
          </div>

          {/* Right — double-bezel preview: audit + ledger */}
          <div className="hero-visual">
            <div className="bezel">
              <div className="bezel-inner">
                {/* window bar */}
                <div className="win-bar">
                  <span className="win-dots"><i /><i /><i /></span>
                  <span className="win-title">Business Auditor — live preview</span>
                  <span className="win-badge">● Live</span>
                </div>

                {/* audit card */}
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
                      { k: 'Google listing', v: 'Verified — 4.7 ★ (312)' , ok: true },
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

                {/* ledger strip */}
                <div className="ledger">
                  <div className="ledger-head">
                    <span>Evidence ledger</span>
                    <span className="ledger-tag">VERIFIED</span>
                  </div>
                  <div className="ledger-line"><span className="mono">fact · phone</span><span>+27 21 888 0100</span><span className="tag-v">VERIFIED</span></div>
                  <div className="ledger-line"><span className="mono">fact · website</span><span>harvesttable.co.za</span><span className="tag-v">VERIFIED</span></div>
                  <div className="ledger-line"><span className="mono">fact · hours</span><span>Mon–Sat 07:00–21:00</span><span className="tag-p">PROBABLE</span></div>
                </div>

                {/* hero image — Cloudinary brain */}
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

      {/* MARQUEE — single instance only */}
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

      {/* TOOLS — asymmetric bento, exactly 6 cells, 2-3 with real images */}
      <section id="tools" className="section">
        <div className="section-head">
          <h2>One platform. Six hunters.</h2>
          <p>Each tool pursues the same mission from a different angle: make you verifiable, then make you contacted.</p>
        </div>

        <div className="bento">
          {/* 1 — CRM — featured 2col + image tint */}
          <Link href="/dashboard/crm" className="cell cell-featured cell-clickable">
            <div className="cell-img">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941986/happyhunterdigital_smart_marketing_Website_card_showcasing_CRM_ead3lc.jpg" alt="Happy Hunter CRM — website card showcasing CRM" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body">
              <span className="pill pill-amber">Agentic first — Eve</span>
              <h3>Happy Hunter CRM</h3>
              <p>The CRM is where the agent keeps its notes. Durable Eve agents, evidence-first ledger, mailbox sync. No hallucinations.</p>
              <div className="cell-tags"><span>Eve durable agents</span><span>Evidence ledger</span><span>Mailbox sync</span></div>
              <span className="cell-link">Open CRM Control Center →</span>
            </div>
          </Link>

          {/* 2 — Auditor */}
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

          {/* 3 — Eve Queue — amber tint */}
          <Link href="/dashboard/crm" className="cell cell-dark cell-clickable">
            <span className="pill" style={{ background:'#7c3aed', color:'#fff', border:'none' }}>Eve Queue · Dispatch</span>
            <h3>Eve Agent Queue</h3>
            <p>Leads land as <span className="mono-inline">AgentTask</span> rows. Eve drains with <span className="mono-inline">FOR UPDATE SKIP LOCKED</span>, researches in a deny-all sandbox, commits VERIFIED vs PROBABLE.</p>
            <div className="cell-tags"><span>FOR UPDATE SKIP LOCKED</span><span>research_person</span></div>
            <span className="cell-link">Open Agent Queue →</span>
          </Link>

          {/* 4 — WhatsApp — image */}
          <Link href="/dashboard/whatsapp" className="cell cell-image cell-clickable">
            <div className="cell-img sm">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941987/happyhunterdigital_smart_marketing_Website_card_design_for_WhatsAppBot_op9wpe.jpg" alt="WhatsApp Bot — website card design" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body sm">
              <span className="pill" style={{ background:'rgba(37,211,102,0.14)', color:'#25D366', borderColor:'rgba(37,211,102,0.25)' }}>● Live — Meta Cloud API</span>
              <h3>WhatsApp Bot — Official</h3>
              <p>Interactive buttons, guided lead flow, AI replies from <span className="mono-inline">servicesKnowledge</span>, secure doc CTAs.</p>
              <span className="cell-link" style={{ color:'#25D366' }}>Open WhatsApp Control →</span>
            </div>
          </Link>

          {/* 5 — OpenReply */}
          <Link href="/dashboard/jobs" className="cell cell-image cell-clickable">
            <div className="cell-img sm">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941987/happyhunterdigital_smart_marketing_Website_card_design_for_InstagramDM_ick4fw.jpg" alt="OpenReply Instagram DM — website card design" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body sm">
              <span className="pill pill-muted">Ready to deploy</span>
              <h3>OpenReply — Instagram DM</h3>
              <p>Self-hosted ManyChat alternative. Keyword on comments/reels → tracked link DMs, follow-gating, BullMQ.</p>
              <div className="cell-tags"><span>Meta Graph API</span><span>BullMQ</span></div>
              <span className="cell-link">View queue →</span>
            </div>
          </Link>

          {/* 6 — Social + OpenMontage combined? keep Social */}
          <Link href="/dashboard/jobs" className="cell cell-clickable">
            <span className="pill pill-muted">Soon</span>
            <h3>Social Analyzer + OpenMontage</h3>
            <p>OSINT across 1000+ networks plus agent-first video pipeline. Footprint, then footage.</p>
            <div className="cell-tags"><span>OSINT</span><span>Remotion</span><span>Whisper</span></div>
            <span className="cell-link">Explore →</span>
          </Link>
        </div>
      </section>

      {/* PROCESS — horizontal steps, not zigzag */}
      <section id="process" className="section section-alt">
        <div className="section-head">
          <h2>How the hunt works</h2>
          <p>Observe, state, move. Three steps, no theatre.</p>
        </div>

        <div className="steps">
          <div className="steps-line" aria-hidden="true" />
          {[
            { n: '01', t: 'Verifiable', d: 'Audit the listing. Fix NAP, hours, category, and trust signals. If an AI can verify you, a customer can.' },
            { n: '02', t: 'Contactable', d: 'Every business on the map is a lead until contacted. Queue it. Let Eve research and commit facts, not guesses.' },
            { n: '03', t: 'Revenue', d: 'Reach them where they reply — WhatsApp buttons, IG DMs, email — with evidence-backed context and secure next steps.' },
          ].map(s => (
            <div key={s.n} className="step">
              <span className="step-n">{s.n}</span>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ENTITY PROOF — dark strip, no fake precise numbers */}
      <section className="proof">
        <div className="proof-inner">
          <div className="proof-copy">
            <h3>Your business exists. To Google, it might as well be a ghost — until we fix that.</h3>
            <p>We read the digital world like tracks in the bush. Every signal points somewhere. We follow it, verify it, and make you findable.</p>
          </div>
          <div className="proof-marks">
            <span><strong>Black</strong> + amber. One accent, everywhere.</span>
            <span><strong>Evidence</strong> over hallucination.</span>
            <span><strong>Data</strong> stays yours.</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA — single primary intent, stacked (no split-header) */}
      <section className="cta">
        <div className="cta-card">
          <p className="eyebrow" style={{ justifyContent: 'center' }}><span className="dot" />Ready when you are</p>
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
            <span className="f-happy">happy</span><span className="f-hunter">hunter</span><span className="f-digital">digital</span>
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
          <span className="footer-meta">Black + amber · Cal Sans / Inter / Mono · Built on Firebase</span>
        </div>
      </footer>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #050505;
          color: #FFFFFF;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }
        .ambient {
          position: fixed;
          inset: -40% -20% auto -20%;
          height: 900px;
          background: radial-gradient(ellipse 900px 600px at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 62%);
          pointer-events: none;
          z-index: 0;
        }
        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
        }

        /* NAV */
        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(10,10,15,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          height: 64px;
          display: flex;
          align-items: center;
        }
        .nav-inner {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .brand { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .brand-mark { width:34px; height:34px; border-radius:8px; overflow:hidden; box-shadow: 0 0 18px rgba(251,191,36,0.28); flex-shrink:0; display:flex; align-items:center; justify-content:center; background:#111; }
        .brand-word { display:flex; flex-direction:column; line-height:1; }
        .w-happy { font-size:15px; font-weight:800; color:#fff; letter-spacing:-0.02em; }
        .w-hunter { font-size:15px; font-weight:800; color:#f59e0b; letter-spacing:-0.02em; }
        .w-sub { font-size:9px; font-weight:800; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280; margin-top:3px; }
        .nav-links { display:flex; align-items:center; gap:18px; }
        .nav-link { font-size:13px; font-weight:600; color:#9ca3af; text-decoration:none; }
        .nav-link:hover { color:#fff; }
        .nav-github { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#f59e0b; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.18); padding:6px 12px; border-radius:999px; text-decoration:none; }
        .nav-github:hover { background:rgba(245,158,11,0.14); }
        .nav-cta { display:flex; align-items:center; gap:10px; }
        .nav-loading { width:18px; height:18px; border:2px solid rgba(255,255,255,0.12); border-top-color:#f59e0b; border-radius:50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg);} }

        /* Buttons — black text on amber per BRAND.md */
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:12px; font-weight:800; text-decoration:none; cursor:pointer; transition: all 0.18s ease; border:1px solid transparent; white-space: nowrap; }
        .btn-amber { background:#f59e0b; color:#050505; border-color:#050505; box-shadow: 0 0 24px rgba(251,191,36,0.18); text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; }
        .btn-amber:hover { background:#fbbf24; box-shadow: 0 0 36px rgba(251,191,36,0.28); transform: translateY(-1px); }
        .btn-amber:active { transform: scale(0.98); }
        .btn-ghost { background: transparent; color:#d1d5db; border-color: rgba(255,255,255,0.1); font-weight:700; }
        .btn-ghost:hover { border-color: rgba(245,158,11,0.35); color:#fff; background: rgba(255,255,255,0.03); }
        .btn-sm { padding: 9px 16px; border-radius: 10px; }
        .btn-lg { padding: 13px 22px; border-radius: 12px; font-size:13px; }
        .btn-arrow { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:999px; background:#050505; color:#f59e0b; font-size:12px; margin-left:2px; }

        /* HERO */
        .hero { max-width:1280px; margin:0 auto; width:100%; padding: 32px 24px 24px; position:relative; z-index:2; }
        .hero-grid { display:grid; grid-template-columns: 1.05fr 0.95fr; gap:40px; align-items:center; min-height: min(560px, 72dvh); }
        .hero-copy { display:flex; flex-direction:column; gap:16px; padding: 18px 0; }
        .eyebrow { display:inline-flex; align-items:center; gap:8px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:10px; font-weight:800; letter-spacing:0.18em; text-transform:uppercase; color:#f59e0b; }
        .dot { width:7px; height:7px; border-radius:50%; background:#f59e0b; box-shadow: 0 0 10px rgba(245,158,11,0.8); animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.55; transform:scale(0.92)} }
        .hero-h1 { font-family: CalSans, Inter, sans-serif; font-size: clamp(34px, 5vw, 56px); font-weight:600; line-height:0.98; letter-spacing:-0.03em; color:#fff; margin:0; }
        .grad { background: linear-gradient(90deg, #fbbf24 0%, #f97316 55%, #ef4444 100%); -webkit-background-clip:text; -webkit-text-fill-color: transparent; background-clip:text; }
        .hero-sub { font-size:15.5px; line-height:1.55; color:#9ca3af; max-width: 520px; margin:0; }
        .hero-actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:6px; }
        .hero-meta { display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-top:6px; font-size:11px; color:#6b7280; }
        .mono { font-family: ui-monospace, monospace; font-size:10.5px; letter-spacing:0.12em; text-transform:uppercase; font-weight:700; color:#9ca3af; }
        .sep { color:#2a2a2a; }

        .hero-visual { display:flex; flex-direction:column; gap:10px; }
        .bezel { padding:6px; border-radius: 2rem; background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(251,191,36,0.07); }
        .bezel-inner { background:#0a0a0a; border-radius: calc(2rem - 6px); overflow:hidden; border:1px solid rgba(255,255,255,0.04); }
        .win-bar { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); background: #0f0f0f; }
        .win-dots { display:flex; gap:6px; }
        .win-dots i { width:10px; height:10px; border-radius:50%; background:#262626; display:block; }
        .win-dots i:first-child { background:#ef4444; }
        .win-dots i:nth-child(2) { background:#f59e0b; }
        .win-dots i:nth-child(3) { background:#22c55e; }
        .win-title { font-family: ui-monospace, monospace; font-size:11px; color:#9ca3af; letter-spacing:0.06em; }
        .win-badge { font-size:10px; font-weight:800; color:#22c55e; background: rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2); padding:2px 8px; border-radius:999px; }

        .preview-card { padding:16px; }
        .pc-top { display:flex; gap:12px; align-items:center; }
        .pc-icon { width:36px; height:36px; border-radius:10px; background: rgba(245,158,11,0.14); color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
        .pc-name { font-size:13px; font-weight:800; color:#fff; }
        .pc-sub { font-size:11px; color:#6b7280; margin-top:2px; }
        .pc-score { margin-left:auto; font-size:18px; font-weight:900; color:#f59e0b; }
        .pc-score span { font-size:12px; font-weight:700; color:#6b7280; }
        .pc-rows { margin-top:14px; display:flex; flex-direction:column; gap:8px; }
        .pc-row { display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); background:#111; font-size:12px; }
        .pc-row.ok { border-color: rgba(34,197,94,0.18); }
        .pc-row.warn { border-color: rgba(245,158,11,0.18); }
        .pc-k { font-family: ui-monospace, monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9ca3af; }
        .pc-v { font-weight:600; color:#e5e7eb; }
        .pc-foot { display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:11px; color:#6b7280; }
        .pc-cta { color:#f59e0b; font-weight:800; }

        .ledger { margin: 0 16px 16px; background:#0f0f0f; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:10px 12px; }
        .ledger-head { display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:#9ca3af; margin-bottom:8px; }
        .ledger-tag { background:#f59e0b; color:#050505; padding:2px 6px; border-radius:4px; font-size:9px; }
        .ledger-line { display:flex; gap:8px; align-items:center; font-size:11.5px; padding:4px 0; border-top:1px solid rgba(255,255,255,0.04); }
        .ledger-line:first-of-type { border-top:none; }
        .mono-inline { font-family: ui-monospace, monospace; font-size:11px; background:rgba(255,255,255,0.06); padding:1px 5px; border-radius:4px; }
        .tag-v { margin-left:auto; font-size:9px; font-weight:800; color:#22c55e; background:rgba(34,197,94,0.1); padding:2px 6px; border-radius:4px; }
        .tag-p { margin-left:auto; font-size:9px; font-weight:800; color:#f59e0b; background:rgba(245,158,11,0.1); padding:2px 6px; border-radius:4px; }

        .preview-img { position:relative; height:160px; overflow:hidden; border-top:1px solid rgba(255,255,255,0.06); }
        .preview-img img { width:100%; height:100%; object-fit:cover; opacity:0.9; }
        .preview-img-scrim { position:absolute; inset:0; background: linear-gradient(to top, rgba(5,5,5,0.85) 0%, transparent 55%); pointer-events:none; }
        .preview-img-label { position:absolute; bottom:10px; left:12px; right:12px; font-family: ui-monospace, monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: rgba(255,255,255,0.9); }
        .hero-caption { font-size:11px; color:#6b7280; text-align:center; font-style: italic; }

        /* Marquee */
        .marquee { background: linear-gradient(to right, #f59e0b, #f97316); color:#050505; overflow:hidden; white-space:nowrap; border-y: 1px solid rgba(0,0,0,0.1); position:relative; z-index:2; }
        .marquee-track { display:inline-flex; align-items:center; gap:18px; padding:10px 0; animation: marquee 22s linear infinite; font-size:11px; font-weight:900; letter-spacing:0.18em; text-transform:uppercase; }
        .marquee-track i { font-style:normal; opacity:0.6; }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

        /* Sections */
        .section { max-width:1280px; margin:0 auto; width:100%; padding: 56px 24px; position:relative; z-index:2; }
        .section-alt { background: rgba(255,255,255,0.01); border-top: 1px solid rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.04); max-width:none; }
        .section-alt .section-head, .section-alt .steps { max-width:1280px; margin-left:auto; margin-right:auto; padding-left:24px; padding-right:24px; }
        .section-head { margin-bottom:28px; max-width: 720px; }
        .section-head h2 { font-family: CalSans, Inter, sans-serif; font-size:30px; font-weight:600; letter-spacing:-0.02em; color:#fff; margin:0 0 8px; }
        .section-head p { font-size:14px; line-height:1.55; color:#9ca3af; margin:0; }

        /* Bento */
        .bento { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
        .cell { background:#0a0a0a; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:18px; display:flex; flex-direction:column; gap:10px; position:relative; overflow:hidden; transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease; text-decoration:none; cursor:pointer; }
        .cell:hover { transform: translateY(-2px); border-color: rgba(245,158,11,0.22); box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
        .cell-featured { grid-column: span 2; padding:0; gap:0; }
        .cell-featured .cell-img { height: 220px; position:relative; overflow:hidden; }
        .cell-img img { width:100%; height:100%; object-fit:cover; }
        .cell-img.sm { height:150px; }
        .cell-scrim { position:absolute; inset:0; background: linear-gradient(to top, rgba(5,5,5,0.75) 0%, rgba(5,5,5,0) 55%); pointer-events:none; }
        .cell-featured .cell-body { padding:18px; display:flex; flex-direction:column; gap:10px; }
        .cell-body.sm { padding: 12px 0 0; }
        .cell-icon { width:36px; height:36px; border-radius:10px; background: rgba(245,158,11,0.12); color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:14px; }
        .cell h3 { font-size:16px; font-weight:800; color:#fff; margin:0; letter-spacing:-0.01em; }
        .cell p { font-size:12.5px; line-height:1.55; color:#9ca3af; margin:0; flex:1; }
        .cell-tags { display:flex; gap:6px; flex-wrap:wrap; }
        .cell-tags span { font-size:10.5px; background:#141414; color:#d1d5db; border:1px solid rgba(255,255,255,0.06); padding:3px 7px; border-radius:6px; }
        .cell-link { font-size:12.5px; font-weight:800; color:#f59e0b; text-decoration:none; }
        .cell-link:hover { color:#fbbf24; }
        .pill { display:inline-flex; align-items:center; font-size:9px; font-weight:900; letter-spacing:0.1em; text-transform:uppercase; padding:4px 8px; border-radius:999px; border:1px solid transparent; width:fit-content; }
        .pill-amber { background:#f59e0b; color:#050505; }
        .pill-live { background: rgba(245,158,11,0.1); color:#f59e0b; border-color: rgba(245,158,11,0.22); }
        .pill-muted { background:#141414; color:#9ca3af; border-color: rgba(255,255,255,0.06); }
        .cell-dark { background: linear-gradient(160deg, rgba(124,58,237,0.08) 0%, #0a0a0a 100%); border-color: rgba(124,58,237,0.18); }
        .cell-image { padding:0; }
        .cell-image .cell-body.sm { padding: 14px 18px 18px; }

        /* Steps */
        .steps { display:grid; grid-template-columns: repeat(3, 1fr); gap:24px; position:relative; margin-top: 10px; }
        .steps-line { position:absolute; top:22px; left:8%; right:8%; height:1px; background: linear-gradient(to right, transparent, rgba(245,158,11,0.35), transparent); }
        .step { background:#0a0a0a; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:10px; }
        .step-n { width:44px; height:44px; border-radius:999px; background:#f59e0b; color:#050505; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; letter-spacing:0.08em; }
        .step h4 { font-size:16px; font-weight:800; color:#fff; margin:0; }
        .step p { font-size:12.5px; line-height:1.6; color:#9ca3af; margin:0; }

        /* Proof */
        .proof { background: #0a0a0f; border-top:1px solid rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.06); position:relative; z-index:2; }
        .proof-inner { max-width:1280px; margin:0 auto; padding:36px 24px; display:grid; grid-template-columns: 1.2fr 0.8fr; gap:32px; align-items:center; }
        .proof-copy h3 { font-family: CalSans, Inter, sans-serif; font-size:22px; font-weight:600; letter-spacing:-0.02em; color:#fff; margin:0 0 10px; line-height:1.2; }
        .proof-copy p { font-size:13.5px; line-height:1.6; color:#9ca3af; margin:0; }
        .proof-marks { display:flex; flex-direction:column; gap:10px; }
        .proof-marks span { font-size:12.5px; color:#d1d5db; background:#111; border:1px solid rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; }
        .proof-marks strong { color:#f59e0b; }

        /* CTA */
        .cta { max-width:1280px; margin:0 auto; width:100%; padding: 48px 24px 0; position:relative; z-index:2; }
        .cta-card { background: #0a0a0a; border:1px solid rgba(255,255,255,0.06); border-radius: 2rem; padding: 40px 28px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; box-shadow: 0 20px 60px rgba(0,0,0,0.45); position:relative; overflow:hidden; }
        .cta-card::before { content:''; position:absolute; inset:0; background: radial-gradient(600px 300px at 50% 0%, rgba(251,191,36,0.06), transparent 70%); pointer-events:none; }
        .cta-card h2 { font-family: CalSans, Inter, sans-serif; font-size:30px; font-weight:600; letter-spacing:-0.02em; color:#fff; margin:0; }
        .cta-card p { font-size:13.5px; line-height:1.6; color:#9ca3af; max-width:560px; margin:0; }
        .cta-actions { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:6px; }
        .cta-note { font-size:11px; color:#6b7280; margin-top:4px; }

        /* Footer */
        .footer { margin-top: 48px; border-top:1px solid rgba(255,255,255,0.06); background:#080808; position:relative; z-index:2; }
        .footer-inner { max-width:1280px; margin:0 auto; padding:28px 24px; display:flex; justify-content:space-between; gap:24px; align-items:flex-start; }
        .footer-brand { display:flex; flex-direction:column; gap:4px; }
        .f-happy { font-size:16px; font-weight:800; color:#fff; }
        .f-hunter { font-size:16px; font-weight:800; color:#f59e0b; }
        .f-digital { font-size:16px; font-weight:800; color:#6b7280; }
        .f-sub { font-size:11px; color:#6b7280; margin-top:6px; max-width:520px; line-height:1.5; }
        .footer-links { display:flex; gap:16px; flex-wrap:wrap; }
        .footer-links a { font-size:12.5px; font-weight:600; color:#9ca3af; text-decoration:none; }
        .footer-links a:hover { color:#f59e0b; }
        .footer-bottom { max-width:1280px; margin:0 auto; padding:14px 24px 24px; display:flex; justify-content:space-between; gap:16px; font-size:11px; color:#6b7280; border-top:1px solid rgba(255,255,255,0.04); }
        .footer-meta { color:#4b5563; }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .dot, .marquee-track, .nav-loading { animation: none !important; }
          .cell:hover, .btn-amber:hover { transform: none !important; }
        }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; min-height:auto; }
          .bento { grid-template-columns: 1fr; }
          .cell-featured { grid-column: auto; }
          .steps { grid-template-columns: 1fr; }
          .steps-line { display:none; }
          .proof-inner { grid-template-columns: 1fr; }
          .footer-inner { flex-direction:column; }
          .nav-links { display:none; }
          .hide-sm { display:none; }
        }
        @media (max-width: 640px) {
          .hero { padding-top:20px; }
          .footer-bottom { flex-direction:column; }
        }
      `}</style>
    </div>
  );
}

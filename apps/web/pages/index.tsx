import { useEffect, useState } from 'react';
import Link from 'next/link';
import { firebaseAuth } from '../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import RoiCalculator from '../components/RoiCalculator';
import DiagnosticCaseStudies from '../components/DiagnosticCaseStudies';

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

      {/* NAV */}
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
            <a href="#work" className="nav-link">Work</a>
            <a href="#calculator" className="nav-link">Estimator</a>
            <a href="#tools" className="nav-link">Tools</a>
            <Link href="/dashboard/billing" className="nav-link">Pricing</Link>
          </div>

          <div className="nav-cta">
            {checkingAuth ? <span className="nav-loading" /> : user ? (
              <Link href="/dashboard" className="btn btn-amber">Open dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="nav-link hide-sm">Sign in</Link>
                <Link href="/login?register=true" className="btn btn-amber">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO — clean, single-column centered */}
      <header className="hero">
        <div className="hero-inner">
          <span className="kicker">Entity-first marketing architecture</span>
          <h1 className="hero-h1">
            We engineer websites that convert. Then we drive the traffic that scales them.
          </h1>
          <p className="hero-sub">
            If an AI cannot verify your entity exists, your traffic converts to zero. We make you verifiable, load in under 100ms, and turn signals into revenue.
          </p>
          <div className="hero-actions">
            <Link href={user ? '/dashboard' : '/login?register=true'} className="btn btn-amber btn-lg">
              Start for free
            </Link>
            <a href="#work" className="btn btn-ghost btn-lg">
              See our work
            </a>
          </div>
          <div className="hero-proof">
            <span>Core Web Vitals</span>
            <span className="proof-dot" />
            <span>Sub-100ms TTFB</span>
            <span className="proof-dot" />
            <span>1,482 ledger facts</span>
            <span className="proof-dot" />
            <span>Zero bloat</span>
          </div>
        </div>
      </header>

      {/* CLIENT PROOF — single image, editorial */}
      <section className="proof-section">
        <div className="proof-inner">
          <div className="proof-image">
            <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787938869/happyhunterdigital_smart_marketing_Digital_brain_with_marketing_icons_202608281925_t1yzqq.jpg" alt="Digital brain with marketing icons — Happy Hunter Digital" loading="eager" />
            <div className="proof-scrim" />
          </div>
          <div className="proof-copy">
            <span className="mono-label">How it works</span>
            <h2>Forensic precision. Not marketing guesses.</h2>
            <p>We run a 50-point audit across your digital footprint — Google listing, NAP consistency, website performance, evidence ledger — then build the architecture that fixes what we find.</p>
          </div>
        </div>
      </section>

      {/* TOOLS — 2-column bento, clean */}
      <section id="tools" className="section">
        <div className="section-head">
          <span className="mono-label">The platform</span>
          <h2>Everything you need. Nothing you don't.</h2>
        </div>

        <div className="bento">
          <Link href="/dashboard/crm" className="cell cell-featured">
            <div className="cell-img">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941986/happyhunterdigital_smart_marketing_Website_card_showcasing_CRM_ead3lc.jpg" alt="Happy Hunter CRM" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body">
              <h3>Happy Hunter CRM</h3>
              <p>The CRM is where the agent keeps its notes. Durable agents, evidence-first ledger, mailbox sync. Zero hallucinations.</p>
            </div>
          </Link>

          <Link href="/dashboard/gmaps-scraper" className="cell">
            <div className="cell-img">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941987/happyhunterdigital_smart_marketing_Google_Maps_business_auditor_kqssi2.jpg" alt="Google Maps Business Auditor" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body">
              <h3>Business Auditor</h3>
              <p>Audit name, category, address, phone, website, ratings. 50+ fields to find red flags before customers do.</p>
            </div>
          </Link>

          <Link href="/dashboard/whatsapp" className="cell">
            <div className="cell-img">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941987/happyhunterdigital_smart_marketing_Website_card_design_for_WhatsAppBot_op9wpe.jpg" alt="WhatsApp Bot" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body">
              <h3>WhatsApp Bot</h3>
              <p>Interactive buttons, guided lead flow, AI replies. Official Meta Cloud API integration.</p>
            </div>
          </Link>

          <Link href="/dashboard/jobs" className="cell">
            <div className="cell-img">
              <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1787941987/happyhunterdigital_smart_marketing_Website_card_design_for_InstagramDM_ick4fw.jpg" alt="OpenReply Instagram DM" loading="lazy" />
              <div className="cell-scrim" />
            </div>
            <div className="cell-body">
              <h3>Instagram DM Automation</h3>
              <p>Keyword on comments and reels triggers tracked link DMs. Follow-gating, background queues.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ESTIMATOR */}
      <section id="calculator" className="section section-alt">
        <div className="section-head section-head-center">
          <span className="mono-label">Performance estimator</span>
          <h2>See your projected revenue lift</h2>
          <p>Calculate what happens when you move to entity-first architecture.</p>
        </div>
        <RoiCalculator />
      </section>

      {/* CASE STUDIES */}
      <section id="work" className="section">
        <div className="section-head">
          <span className="mono-label">Case studies</span>
          <h2>Built like engineering audits</h2>
          <p>No vague agency screenshots. Every project structured into baseline problem, execution, and proof.</p>
        </div>
        <DiagnosticCaseStudies />
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Start hunting. Free workspace.</h2>
          <p>Spin up the auditor and CRM in minutes. Upgrade only when you need more searches, agents, or channels.</p>
          <div className="cta-actions">
            <Link href={user ? '/dashboard' : '/login?register=true'} className="btn btn-amber btn-lg">
              Launch workspace
            </Link>
            <Link href="/dashboard/billing" className="btn btn-ghost btn-lg">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="f-line"><span className="f-happy">happy</span><span className="f-hunter">hunter</span><span className="f-digital">digital</span></span>
            <span className="f-sub">South African digital entity architecture firm. Entity-first marketing. Agentic revenue systems.</span>
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
          <span>&copy; {new Date().getFullYear()} Happy Hunter Digital</span>
        </div>
      </footer>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #050505;
          color: #fff;
          font-family: var(--font-sans);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }
        .ambient {
          position: fixed;
          inset: -40% -20% auto -20%;
          height: 900px;
          background: radial-gradient(ellipse 900px 600px at 50% 0%, rgba(251,191,36,0.05) 0%, transparent 62%);
          pointer-events: none;
          z-index: 0;
        }
        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
        }

        /* ─── NAV ─── */
        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(5,5,5,0.92);
          backdrop-filter: blur(20px);
          height: 72px;
          display: flex;
          align-items: center;
        }
        .nav-inner {
          max-width: 1120px;
          width: 100%;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .brand { display:flex; align-items:center; gap:12px; text-decoration:none; }
        .brand-mark { width:32px; height:32px; border-radius:8px; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .brand-word { display:flex; flex-direction:column; line-height:1; }
        .w-name { display:inline-flex; align-items:baseline; font-size:15px; font-weight:800; letter-spacing:-0.02em; line-height:1; white-space:nowrap; font-family:var(--font-display); }
        .w-happy { color:#fff; } .w-hunter { color:#f59e0b; } .w-digital { color:#fff; }
        .w-sub { font-size:9px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#52525b; margin-top:3px; font-family:var(--font-mono); }
        .nav-links { display:flex; align-items:center; gap:32px; }
        .nav-link { font-size:13px; font-weight:500; color:#71717a; text-decoration:none; transition: color 0.2s; }
        .nav-link:hover { color:#fff; }
        .nav-cta { display:flex; align-items:center; gap:12px; }
        .nav-loading { width:18px; height:18px; border:2px solid rgba(255,255,255,0.08); border-top-color:#f59e0b; border-radius:50%; animation:spin 0.7s linear infinite; }
        @keyframes spin{ to{transform:rotate(360deg);} }

        /* ─── BUTTONS ─── */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
          font-size: 13px;
          padding: 10px 20px;
        }
        .btn-amber {
          background: #f59e0b;
          color: #050505;
          border: none;
        }
        .btn-amber:hover { background: #fbbf24; transform: translateY(-1px); }
        .btn-ghost {
          background: transparent;
          color: #a1a1aa;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.15); color: #fff; }
        .btn-lg { padding: 14px 28px; font-size: 14px; border-radius: 14px; }

        /* ─── HERO ─── */
        .hero {
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
          padding: 120px 32px 80px;
          position: relative;
          z-index: 2;
        }
        .hero-inner {
          max-width: 720px;
        }
        .kicker {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #f59e0b;
          margin-bottom: 24px;
        }
        .hero-h1 {
          font-family: var(--font-display);
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #fff;
          margin: 0 0 24px;
        }
        .hero-sub {
          font-size: 17px;
          line-height: 1.7;
          color: #71717a;
          max-width: 560px;
          margin: 0 0 40px;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .hero-proof {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          font-family: var(--font-mono);
          font-size: 11px;
          color: #52525b;
          letter-spacing: 0.04em;
        }
        .proof-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #27272a;
        }

        /* ─── PROOF SECTION ─── */
        .proof-section {
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
          padding: 0 32px 120px;
          position: relative;
          z-index: 2;
        }
        .proof-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .proof-image {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 4/3;
        }
        .proof-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .proof-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.5) 100%);
          pointer-events: none;
        }
        .proof-copy .mono-label {
          display: block;
          margin-bottom: 16px;
        }
        .proof-copy h2 {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #fff;
          margin: 0 0 16px;
          line-height: 1.1;
        }
        .proof-copy p {
          font-size: 15px;
          line-height: 1.7;
          color: #71717a;
          margin: 0;
        }

        /* ─── SECTIONS ─── */
        .section {
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
          padding: 120px 32px;
          position: relative;
          z-index: 2;
        }
        .section-alt {
          max-width: none;
          background: rgba(255,255,255,0.015);
          padding: 120px 32px;
        }
        .section-alt > * {
          max-width: 1120px;
          margin-left: auto;
          margin-right: auto;
        }
        .section-head {
          margin-bottom: 64px;
        }
        .section-head-center {
          text-align: center;
        }
        .mono-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #52525b;
          margin-bottom: 12px;
        }
        .section-head h2 {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #fff;
          margin: 0 0 12px;
          line-height: 1.1;
        }
        .section-head p {
          font-size: 15px;
          line-height: 1.7;
          color: #71717a;
          max-width: 560px;
          margin: 0;
        }
        .section-head-center p {
          margin: 0 auto;
        }

        /* ─── BENTO ─── */
        .bento {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .cell {
          background: #0a0a0a;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .cell:hover { transform: translateY(-2px); }
        .cell-featured {
          grid-column: span 2;
          flex-direction: row;
        }
        .cell-img {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16/10;
        }
        .cell-featured .cell-img {
          width: 50%;
          aspect-ratio: auto;
        }
        .cell-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cell-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        .cell-body {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .cell h3 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .cell p {
          font-size: 14px;
          line-height: 1.65;
          color: #71717a;
          margin: 0;
        }

        /* ─── CTA ─── */
        .cta-section {
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
          padding: 0 32px 120px;
          position: relative;
          z-index: 2;
        }
        .cta-card {
          background: #0a0a0a;
          border-radius: 24px;
          padding: 80px 48px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .cta-card h2 {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #fff;
          margin: 0;
        }
        .cta-card p {
          font-size: 15px;
          line-height: 1.6;
          color: #71717a;
          max-width: 480px;
          margin: 0;
        }
        .cta-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }

        /* ─── FOOTER ─── */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.04);
          background: #050505;
          position: relative;
          z-index: 2;
        }
        .footer-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 48px 32px;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
        }
        .f-line {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .f-happy { color: #fff; } .f-hunter { color: #f59e0b; } .f-digital { color: #52525b; }
        .f-sub {
          display: block;
          font-size: 12px;
          color: #3f3f46;
          margin-top: 8px;
          max-width: 420px;
          line-height: 1.6;
        }
        .footer-links { display:flex; gap:24px; flex-wrap:wrap; }
        .footer-links a {
          font-size: 13px;
          font-weight: 500;
          color: #52525b;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: #f59e0b; }
        .footer-bottom {
          max-width: 1120px;
          margin: 0 auto;
          padding: 20px 32px 32px;
          font-size: 12px;
          color: #27272a;
          border-top: 1px solid rgba(255,255,255,0.03);
        }

        /* ─── RESPONSIVE ─── */
        @media (prefers-reduced-motion: reduce) {
          .cell, .btn { animation: none !important; transition: none !important; transform: none !important; }
        }
        @media (max-width: 834px) {
          .nav-links { display: none; }
          .hide-sm { display: none; }
          .hero { padding: 80px 24px 60px; }
          .proof-inner { grid-template-columns: 1fr; gap: 40px; }
          .bento { grid-template-columns: 1fr; }
          .cell-featured { grid-column: auto; flex-direction: column; }
          .cell-featured .cell-img { width: 100%; aspect-ratio: 16/10; }
          .section { padding: 80px 24px; }
          .section-alt { padding: 80px 24px; }
          .cta-section { padding: 0 24px 80px; }
          .cta-card { padding: 56px 24px; }
          .footer-inner { flex-direction: column; }
        }
        @media (max-width: 480px) {
          .hero { padding: 64px 20px 48px; }
          .hero-h1 { font-size: 32px; }
          .section { padding: 64px 20px; }
          .section-alt { padding: 64px 20px; }
          .proof-section { padding: 0 20px 64px; }
          .cta-section { padding: 0 20px 64px; }
        }
      `}</style>
    </div>
  );
}

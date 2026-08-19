import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { firebaseAuth } from '../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="top-navbar">
        <div className="nav-brand">
          <div className="brand-logo">
            <span className="logo-symbol">🧠</span>
          </div>
          <div className="brand-text">
            <span className="brand-name">HAPPY HUNTER DIGITAL</span>
            <span className="brand-sub">Smart Marketing Platform</span>
          </div>
        </div>

        <div className="nav-actions">
          <a
            href="https://github.com/happyhunterdigital/crm"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost github-link"
          >
            ⭐ GitHub
          </a>

          {checkingAuth ? (
            <div className="auth-placeholder">...</div>
          ) : user ? (
            <Link href="/dashboard" className="btn btn-gold">
              Go to Dashboard →
            </Link>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="btn btn-ghost">
                Sign In
              </Link>
              <Link href="/login?register=true" className="btn btn-gold">
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          <span>Digital Entity Architecture Firm</span>
        </div>

        <h1 className="hero-title">
          "Architecting digital dominance <br />
          <span className="gold-text">for ambitious South African entities."</span>
        </h1>

        <p className="hero-subtitle">
          Prepare your enterprise for the AI-driven economy with autonomous lead automation,
          mathematically verified CRM intelligence, and high-contrast Generative Engine Optimization.
        </p>

        <div className="hero-cta-group">
          <Link href={user ? '/dashboard' : '/login?register=true'} className="btn btn-lg btn-gold">
            {user ? 'Enter Dashboard Suite →' : 'Launch Free Workspace →'}
          </Link>
          <Link href="/dashboard/crm" className="btn btn-lg btn-secondary">
            ⚡ Explore Happy Hunter CRM
          </Link>
        </div>

        {/* Brand Values Banner */}
        <div className="values-banner">
          <span className="value-item">DATA SOVEREIGNTY</span>
          <span className="value-dot">·</span>
          <span className="value-item">MATHEMATICAL CERTAINTY</span>
          <span className="value-dot">·</span>
          <span className="value-item">VERIFIED TRUST</span>
          <span className="value-dot">·</span>
          <span className="value-item">AUTONOMOUS AGENTS</span>
        </div>

        {/* Feature Grid */}
        <div className="features-grid">
          {/* Card 1: Happy Hunter CRM */}
          <div className="feature-card featured">
            <div className="card-badge">Agentic First</div>
            <div className="card-icon gold-bg">⚡</div>
            <h3 className="card-title">Happy Hunter CRM</h3>
            <p className="card-desc">
              The agent is not a feature of the CRM — the CRM is where the agent keeps its notes.
              Powered by Eve durable agents, an evidence-first fact ledger, and zero hallucinations.
            </p>
            <div className="card-tags">
              <span>Eve Durable Agents</span>
              <span>Evidence Ledger</span>
              <span>Mailbox Sync</span>
            </div>
          </div>

          {/* Card 2: Google Maps Scraper */}
          <div className="feature-card">
            <div className="card-badge live">Live Tool</div>
            <div className="card-icon gold-bg">📍</div>
            <h3 className="card-title">Google Maps Business Auditor</h3>
            <p className="card-desc">
              Audit your own business listing — verify name, category, address, phone, website, and ratings.
              50+ data fields to find and fix red flags before customers do.
            </p>
            <div className="card-tags">
              <span>Botasaurus</span>
              <span>50+ Data Points</span>
              <span>Country-Scale</span>
            </div>
          </div>

          {/* Card 3: OpenReply */}
          <div className="feature-card">
            <div className="card-badge soon">Ready to Deploy</div>
            <div className="card-icon gold-bg">💬</div>
            <h3 className="card-title">OpenReply (Instagram DM)</h3>
            <p className="card-desc">
              Self-hosted ManyChat alternative. Comment a keyword on posts/reels to instantly
              trigger tracked link DMs, follow-gating, and automated sales conversations.
            </p>
            <div className="card-tags">
              <span>Official Meta API</span>
              <span>Follow Gates</span>
              <span>BullMQ</span>
            </div>
          </div>

          {/* Card 4: OpenWA */}
          <div className="feature-card">
            <div className="card-badge soon">Ready to Deploy</div>
            <div className="card-icon gold-bg">📱</div>
            <h3 className="card-title">OpenWA (WhatsApp Gateway)</h3>
            <p className="card-desc">
              Self-hosted WhatsApp automation powered by Baileys. Send transactional updates,
              notifications, and interactive chatbot flows without per-message charges.
            </p>
            <div className="card-tags">
              <span>Baileys Gateway</span>
              <span>Webhooks</span>
              <span>Zero Message Cost</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-left">
          <strong>Happy Hunter Digital</strong> — South African Digital Entity Architecture Firm
        </div>
        <div className="footer-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/crm">CRM</Link>
          <Link href="/dashboard/gmaps-scraper">Audit</Link>
          <Link href="/dashboard/billing">Pricing</Link>
        </div>
      </footer>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background: #050505;
          color: #FFFFFF;
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
        }

        .top-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 48px;
          border-bottom: 1px solid #1F1F1F;
          background: rgba(13, 13, 13, 0.85);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 38px;
          height: 38px;
          background: #EAB308;
          color: #050505;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          box-shadow: 0 0 16px rgba(234, 179, 8, 0.4);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 14px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: 0.5px;
        }

        .brand-sub {
          font-size: 10px;
          color: #EAB308;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: 'Inter', sans-serif;
        }

        .btn-ghost {
          background: transparent;
          color: #D1D5DB;
        }

        .btn-ghost:hover {
          color: #FFFFFF;
          background: #141414;
        }

        .btn-gold {
          background: #EAB308;
          color: #050505;
          box-shadow: 0 0 15px rgba(234, 179, 8, 0.35);
        }

        .btn-gold:hover {
          background: #ca8a04;
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(234, 179, 8, 0.5);
        }

        .btn-secondary {
          background: #141414;
          color: #FFFFFF;
          border: 1px solid #262626;
        }

        .btn-secondary:hover {
          background: #1F1F1F;
          border-color: #EAB308;
        }

        .btn-lg {
          padding: 14px 28px;
          font-size: 15px;
          border-radius: 8px;
        }

        .hero-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 70px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
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
          letter-spacing: 1.2px;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 24px;
        }

        .badge-pulse {
          width: 8px;
          height: 8px;
          background: #EAB308;
          border-radius: 50%;
          box-shadow: 0 0 10px #EAB308;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .hero-title {
          font-size: 46px;
          font-weight: 900;
          line-height: 1.18;
          letter-spacing: -1px;
          color: #FFFFFF;
          margin: 0 0 20px;
        }

        .gold-text {
          color: #EAB308;
          text-shadow: 0 0 30px rgba(234, 179, 8, 0.3);
        }

        .hero-subtitle {
          font-size: 16px;
          line-height: 1.65;
          color: #8E8E93;
          max-width: 760px;
          margin: 0 0 32px;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .values-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 24px;
          background: #0D0D0D;
          border: 1px solid #1F1F1F;
          border-radius: 30px;
          margin-bottom: 60px;
          font-size: 11px;
          font-weight: 800;
          color: #8E8E93;
          letter-spacing: 1.5px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .value-item {
          color: #EAB308;
        }

        .value-dot {
          color: #333333;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 20px;
          width: 100%;
          text-align: left;
        }

        .feature-card {
          background: #0D0D0D;
          border: 1px solid #1F1F1F;
          border-radius: 12px;
          padding: 26px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          border-color: #EAB308;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .feature-card.featured {
          border-color: rgba(234, 179, 8, 0.4);
          background: linear-gradient(180deg, rgba(234, 179, 8, 0.05) 0%, #0D0D0D 100%);
        }

        .card-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          background: rgba(234, 179, 8, 0.15);
          color: #EAB308;
        }

        .card-badge.live {
          background: rgba(234, 179, 8, 0.2);
          color: #EAB308;
        }

        .card-badge.soon {
          background: #1A1A1A;
          color: #8E8E93;
        }

        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 16px;
        }

        .gold-bg {
          background: rgba(234, 179, 8, 0.15);
          color: #EAB308;
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 8px;
        }

        .card-desc {
          font-size: 13px;
          color: #8E8E93;
          line-height: 1.55;
          margin: 0 0 18px;
          flex: 1;
        }

        .card-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .card-tags span {
          font-size: 11px;
          background: #141414;
          color: #D1D5DB;
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid #1F1F1F;
        }

        .landing-footer {
          margin-top: auto;
          border-top: 1px solid #1F1F1F;
          padding: 24px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #8E8E93;
          background: #0D0D0D;
        }

        .footer-links {
          display: flex;
          gap: 20px;
        }

        .footer-links a {
          color: #8E8E93;
          text-decoration: none;
          font-weight: 500;
        }

        .footer-links a:hover {
          color: #EAB308;
        }

        @media (max-width: 768px) {
          .top-navbar {
            padding: 16px 20px;
          }
          .hero-title {
            font-size: 30px;
          }
          .landing-footer {
            flex-direction: column;
            gap: 12px;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

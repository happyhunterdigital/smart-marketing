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
          <div className="brand-logo">HH</div>
          <div className="brand-text">
            <span className="brand-name">Happy Hunter Digital</span>
            <span className="brand-sub">Marketing Cloud</span>
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
            <div className="auth-placeholder">Checking...</div>
          ) : user ? (
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard →
            </Link>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="btn btn-ghost">
                Sign In
              </Link>
              <Link href="/login?register=true" className="btn btn-primary">
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
          <span>Next-Gen Agentic Marketing Infrastructure</span>
        </div>

        <h1 className="hero-title">
          Autonomous AI Agents & Lead Generation <br />
          <span className="gradient-text">Built for Modern Growth Teams</span>
        </h1>

        <p className="hero-subtitle">
          Supercharge your customer acquisition with Happy Hunter CRM, real-time Google Maps lead extraction,
          Instagram comment-to-DM automation, and self-hosted WhatsApp communication gateways.
        </p>

        <div className="hero-cta-group">
          <Link href={user ? '/dashboard' : '/login?register=true'} className="btn btn-lg btn-primary">
            {user ? 'Enter Dashboard Suite →' : 'Launch Free Workspace →'}
          </Link>
          <Link href="/dashboard/crm" className="btn btn-lg btn-secondary">
            ⚡ Explore Happy Hunter CRM
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="features-grid">
          {/* Card 1: Happy Hunter CRM */}
          <div className="feature-card featured">
            <div className="card-badge">Agentic First</div>
            <div className="card-icon blue">⚡</div>
            <h3 className="card-title">Happy Hunter CRM</h3>
            <p className="card-desc">
              The agent is not a chatbot in the CRM — the CRM is where the agent keeps its notes.
              Powered by Eve durable agents, evidence-first fact ledger, NestJS tRPC, and zero hallucinations.
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
            <div className="card-icon green">📍</div>
            <h3 className="card-title">Google Maps Lead Scraper</h3>
            <p className="card-desc">
              Extract high-intent local business leads, verified contact details, email addresses,
              decision-makers, and customer reviews with 50+ rich data fields.
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
            <div className="card-icon purple">💬</div>
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
            <div className="card-icon emerald">📱</div>
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
        <p>© 2026 Happy Hunter Digital. All rights reserved.</p>
        <div className="footer-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/crm">CRM</Link>
          <Link href="/dashboard/gmaps-scraper">Scraper</Link>
          <Link href="/dashboard/billing">Pricing</Link>
        </div>
      </footer>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background: #090d16;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
        }

        .top-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 48px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(15, 23, 42, 0.6);
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
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: white;
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.35);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 15px;
          font-weight: 700;
          color: #f8fafc;
        }

        .brand-sub {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
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
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
        }

        .btn-ghost {
          background: transparent;
          color: #cbd5e1;
        }

        .btn-ghost:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0284c7, #2563eb);
          color: white;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
        }

        .btn-primary:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
        }

        .btn-secondary {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid #334155;
        }

        .btn-secondary:hover {
          background: #334155;
        }

        .btn-lg {
          padding: 14px 28px;
          font-size: 15px;
          border-radius: 10px;
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
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          color: #38bdf8;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 24px;
        }

        .badge-pulse {
          width: 8px;
          height: 8px;
          background: #38bdf8;
          border-radius: 50%;
          box-shadow: 0 0 10px #38bdf8;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .hero-title {
          font-size: 46px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -1px;
          color: #f8fafc;
          margin: 0 0 20px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 16px;
          line-height: 1.6;
          color: #94a3b8;
          max-width: 760px;
          margin: 0 0 36px;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          margin-bottom: 64px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 20px;
          width: 100%;
          text-align: left;
        }

        .feature-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 26px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          border-color: #334155;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }

        .feature-card.featured {
          border-color: rgba(56, 189, 248, 0.35);
          background: linear-gradient(180deg, rgba(14, 165, 233, 0.08) 0%, #0f172a 100%);
        }

        .card-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
        }

        .card-badge.live {
          background: rgba(74, 222, 128, 0.15);
          color: #4ade80;
        }

        .card-badge.soon {
          background: #1e293b;
          color: #94a3b8;
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

        .card-icon.blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
        .card-icon.green { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
        .card-icon.purple { background: rgba(192, 132, 252, 0.15); color: #c084fc; }
        .card-icon.emerald { background: rgba(52, 211, 153, 0.15); color: #34d399; }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 8px;
        }

        .card-desc {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
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
          background: #1e293b;
          color: #cbd5e1;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .landing-footer {
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 24px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #64748b;
        }

        .footer-links {
          display: flex;
          gap: 20px;
        }

        .footer-links a {
          color: #94a3b8;
          text-decoration: none;
        }

        .footer-links a:hover {
          color: #38bdf8;
        }

        @media (max-width: 768px) {
          .top-navbar {
            padding: 16px 20px;
          }
          .hero-title {
            font-size: 32px;
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

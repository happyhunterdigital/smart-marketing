import DashboardLayout from '../../components/DashboardLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { firebaseAuth, firestore } from '../../lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function DashboardHome() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseAuth.currentUser) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', firebaseAuth.currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };
    fetchUserData();
  }, []);

  return (
    <DashboardLayout>
      <div className="overview-container">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div>
            <span className="platform-tag">⚡ Marketing Cloud Suite</span>
            <h1 className="banner-title">Welcome to Happy Hunter Digital</h1>
            <p className="banner-desc">
              Your centralized command center for autonomous AI agents, lead generation, and multi-channel outreach.
            </p>
          </div>
          <div className="banner-stats">
            <div className="banner-stat">
              <span className="stat-num">{userData?.gmapsQuota ?? 200}</span>
              <span className="stat-label">Searches Remaining</span>
            </div>
            <div className="banner-stat">
              <span className="stat-num">{userData?.plan ? userData.plan.toUpperCase() : 'FREE'}</span>
              <span className="stat-label">Current Tier</span>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="section-title">
          <h2>Core Intelligence & Automation Tools</h2>
          <span>Available across your connected workspace</span>
        </div>

        <div className="tools-grid">
          {/* Happy Hunter CRM Card */}
          <div className="tool-card featured">
            <div className="tool-card-top">
              <div className="tool-icon-box blue">⚡</div>
              <span className="featured-badge">Autonomous Eve Agent</span>
            </div>
            <h3 className="tool-name">Happy Hunter CRM</h3>
            <p className="tool-desc">
              Agentic-first CRM where the agent is not a chatbot — it is where the agent keeps its notes.
              Features Eve durable agents, evidence ledger, mailbox sync, and zero hallucinations.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">happyhunterdigital/crm</span>
                <span className="tag">NestJS + Eve</span>
              </div>
              <Link href="/dashboard/crm" className="tool-btn btn-primary">
                Open CRM Control Center →
              </Link>
            </div>
          </div>

          {/* Google Maps Scraper Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box green">📍</div>
              <span className="status-badge live">Live</span>
            </div>
            <h3 className="tool-name">Google Maps Scraper</h3>
            <p className="tool-desc">
              Extract high-intent business leads, emails, social links, and reviews directly from Google Maps
              with up to 50+ data points per business.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">Botasaurus</span>
                <span className="tag">50+ Fields</span>
              </div>
              <Link href="/dashboard/gmaps-scraper" className="tool-btn btn-secondary">
                Start Scraping →
              </Link>
            </div>
          </div>

          {/* OpenReply Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box purple">💬</div>
              <span className="status-badge upcoming">Skill Available</span>
            </div>
            <h3 className="tool-name">OpenReply (Instagram DM)</h3>
            <p className="tool-desc">
              Self-hosted Instagram comment-to-DM automation. Comment a keyword on posts/reels to instantly
              trigger tracked link DMs and follow-gating.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">BullMQ</span>
                <span className="tag">Meta Graph API</span>
              </div>
              <Link href="/dashboard/jobs" className="tool-btn btn-secondary">
                View Queue →
              </Link>
            </div>
          </div>

          {/* OpenWA Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box green">📱</div>
              <span className="status-badge upcoming">Skill Available</span>
            </div>
            <h3 className="tool-name">OpenWA (WhatsApp API)</h3>
            <p className="tool-desc">
              Self-hosted WhatsApp API gateway powered by Baileys. Send notifications, chat triggers,
              and interactive flows with zero per-message fees.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">Baileys API</span>
                <span className="tag">Webhooks</span>
              </div>
              <Link href="/dashboard/jobs" className="tool-btn btn-secondary">
                Configure →
              </Link>
            </div>
          </div>

          {/* Social Analyzer Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box orange">🔍</div>
              <span className="status-badge upcoming">Skill Available</span>
            </div>
            <h3 className="tool-name">Social Analyzer</h3>
            <p className="tool-desc">
              Cross-platform OSINT username search and digital footprint analyzer across 1000+ social networks,
              forums, and websites.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">OSINT</span>
                <span className="tag">1000+ Sites</span>
              </div>
              <Link href="/dashboard/jobs" className="tool-btn btn-secondary">
                Explore →
              </Link>
            </div>
          </div>

          {/* OpenMontage Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box pink">🎬</div>
              <span className="status-badge upcoming">Skill Available</span>
            </div>
            <h3 className="tool-name">OpenMontage (AI Video)</h3>
            <p className="tool-desc">
              Agent-first video production pipeline. Auto-generates captions, B-roll overlays, vertical cuts,
              and viral marketing shorts.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">Remotion</span>
                <span className="tag">Whisper AI</span>
              </div>
              <Link href="/dashboard/jobs" className="tool-btn btn-secondary">
                Explore →
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          .overview-container {
            display: flex;
            flex-direction: column;
            gap: 28px;
          }

          .welcome-banner {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          }

          .platform-tag {
            font-size: 11px;
            font-weight: 700;
            color: #38bdf8;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
            display: inline-block;
          }

          .banner-title {
            font-size: 26px;
            font-weight: 800;
            color: #f8fafc;
            margin: 0 0 8px;
          }

          .banner-desc {
            font-size: 13.5px;
            color: #94a3b8;
            margin: 0;
            max-width: 600px;
            line-height: 1.5;
          }

          .banner-stats {
            display: flex;
            gap: 16px;
          }

          .banner-stat {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 14px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 130px;
          }

          .stat-num {
            font-size: 22px;
            font-weight: 800;
            color: #38bdf8;
          }

          .stat-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-top: 4px;
          }

          .section-title {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          }

          .section-title h2 {
            font-size: 18px;
            font-weight: 700;
            color: #f8fafc;
            margin: 0;
          }

          .section-title span {
            font-size: 12px;
            color: #64748b;
          }

          .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
            gap: 20px;
          }

          .tool-card {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            transition: all 0.2s ease;
          }

          .tool-card:hover {
            border-color: #334155;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          }

          .tool-card.featured {
            border-color: rgba(56, 189, 248, 0.4);
            background: linear-gradient(180deg, rgba(14, 165, 233, 0.06) 0%, #0f172a 100%);
          }

          .tool-card-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
          }

          .tool-icon-box {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }

          .tool-icon-box.blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
          .tool-icon-box.green { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
          .tool-icon-box.purple { background: rgba(192, 132, 252, 0.15); color: #c084fc; }
          .tool-icon-box.orange { background: rgba(251, 146, 60, 0.15); color: #fb923c; }
          .tool-icon-box.pink { background: rgba(244, 114, 182, 0.15); color: #f472b6; }

          .featured-badge {
            font-size: 10px;
            font-weight: 700;
            background: linear-gradient(135deg, #0284c7, #2563eb);
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            text-transform: uppercase;
          }

          .status-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 12px;
          }

          .status-badge.live {
            background: rgba(74, 222, 128, 0.15);
            color: #4ade80;
          }

          .status-badge.upcoming {
            background: #1e293b;
            color: #94a3b8;
          }

          .tool-name {
            font-size: 17px;
            font-weight: 700;
            color: #f8fafc;
            margin: 0 0 8px;
          }

          .tool-desc {
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.5;
            margin: 0 0 20px;
            flex: 1;
          }

          .tool-footer {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .tool-tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .tag {
            font-size: 11px;
            background: #1e293b;
            color: #cbd5e1;
            padding: 2px 8px;
            border-radius: 4px;
          }

          .tool-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.15s ease;
          }

          .btn-primary {
            background: linear-gradient(135deg, #0284c7, #2563eb);
            color: white;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
          }

          .btn-primary:hover {
            opacity: 0.95;
            transform: translateY(-1px);
          }

          .btn-secondary {
            background: #1e293b;
            color: #f1f5f9;
            border: 1px solid #334155;
          }

          .btn-secondary:hover {
            background: #334155;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

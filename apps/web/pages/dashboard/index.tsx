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
            <span className="platform-tag">⚡ DIGITAL ENTITY ARCHITECTURE</span>
            <h1 className="banner-title">Happy Hunter Smart Marketing</h1>
            <p className="banner-desc">
              "Architecting digital dominance for ambitious South African entities."
              Your command center for autonomous AI research agents, business audits, and multi-channel marketing automation.
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
          <h2>Autonomous Intelligence & Automation Tools</h2>
          <span>Mathematical Certainty · Verified Trust · Data Sovereignty</span>
        </div>

        <div className="tools-grid">
          {/* Happy Hunter CRM Card — featured */}
          <div className="tool-card featured">
            <div className="tool-card-top">
              <div className="tool-icon-box gold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="featured-badge">Autonomous Eve Agent</span>
            </div>
            <h3 className="tool-name">Happy Hunter CRM</h3>
            <p className="tool-desc">
              Agentic-first CRM where the agent is not a chatbot — the CRM is where the agent keeps its notes.
              Features Eve durable agents, evidence ledger, mailbox sync, and zero hallucinations.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">happyhunterdigital/crm</span>
                <span className="tag">Eve + NestJS</span>
              </div>
              <Link href="/dashboard/crm" className="tool-btn btn-gold" id="index-crm-btn">
                Open CRM Control Center →
              </Link>
            </div>
          </div>

          {/* Google Maps Scraper Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box amber-light">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className="status-badge live">Live Tool</span>
            </div>
            <h3 className="tool-name">Google Maps Business Auditor</h3>
            <p className="tool-desc">
              Audit your own Google Maps listing — verify name, category, address, phone, website, and ratings.
              50+ data fields to find and fix red flags.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">Botasaurus</span>
                <span className="tag">50+ Fields</span>
              </div>
              <Link href="/dashboard/gmaps-scraper" className="tool-btn btn-secondary" id="index-gmaps-btn">
                Run Audit →
              </Link>
            </div>
          </div>

          {/* OpenReply Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box amber-light">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className="status-badge upcoming">Ready to Deploy</span>
            </div>
            <h3 className="tool-name">OpenReply — Instagram DM</h3>
            <p className="tool-desc">
              Self-hosted Instagram comment-to-DM automation. Comment a keyword on posts/reels to instantly
              trigger tracked link DMs and follow-gating.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">BullMQ</span>
                <span className="tag">Meta Graph API</span>
              </div>
              <Link href="/dashboard/jobs" className="tool-btn btn-secondary" id="index-openreply-btn">
                View Queue →
              </Link>
            </div>
          </div>

          {/* OpenWA Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box amber-light">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 8.09a16 16 0 0 0 6 6l.86-.87a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="status-badge upcoming">Ready to Deploy</span>
            </div>
            <h3 className="tool-name">OpenWA — WhatsApp API</h3>
            <p className="tool-desc">
              Self-hosted WhatsApp API gateway powered by Baileys. Send notifications, chat triggers,
              and interactive flows with zero per-message fees.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">Baileys API</span>
                <span className="tag">Webhooks</span>
              </div>
              <Link href="/dashboard/jobs" className="tool-btn btn-secondary" id="index-openwa-btn">
                Configure →
              </Link>
            </div>
          </div>

          {/* Social Analyzer Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box amber-light">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <span className="status-badge upcoming">Ready to Deploy</span>
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
              <Link href="/dashboard/jobs" className="tool-btn btn-secondary" id="index-osint-btn">
                Explore →
              </Link>
            </div>
          </div>

          {/* OpenMontage Card */}
          <div className="tool-card">
            <div className="tool-card-top">
              <div className="tool-icon-box amber-light">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
              </div>
              <span className="status-badge upcoming">Ready to Deploy</span>
            </div>
            <h3 className="tool-name">OpenMontage — AI Video</h3>
            <p className="tool-desc">
              Agent-first video production pipeline. Auto-generates captions, B-roll overlays, vertical cuts,
              and viral marketing shorts.
            </p>
            <div className="tool-footer">
              <div className="tool-tags">
                <span className="tag">Remotion</span>
                <span className="tag">Whisper AI</span>
              </div>
              <Link href="/dashboard/jobs" className="tool-btn btn-secondary" id="index-montage-btn">
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

          /* Double-bezel welcome banner per BRAND.md §6 */
          .welcome-banner {
            background: #0a0a0a;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 1.5rem;
            padding: 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.06);
            position: relative;
            overflow: hidden;
          }

          /* Ambient glow inside banner */
          .welcome-banner::before {
            content: '';
            position: absolute;
            top: -80px;
            right: -80px;
            width: 320px;
            height: 320px;
            background: radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%);
            pointer-events: none;
          }

          /* Forensic mono eyebrow per BRAND.md §4 */
          .platform-tag {
            font-size: 10px;
            font-weight: 900;
            color: #f59e0b;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-family: 'SF Mono', Consolas, monospace;
            margin-bottom: 10px;
            display: inline-block;
          }

          /* Cal Sans display heading per BRAND.md §4 */
          .banner-title {
            font-size: 28px;
            font-weight: 600;
            font-family: 'CalSans', 'Inter', sans-serif;
            color: #FFFFFF;
            margin: 0 0 10px;
            letter-spacing: -0.02em;
            line-height: 1.1;
          }

          .banner-desc {
            font-size: 13.5px;
            color: #8E8E93;
            margin: 0;
            max-width: 620px;
            line-height: 1.5;
          }

          .banner-stats {
            display: flex;
            gap: 16px;
          }

          .banner-stat {
            background: #141414;
            border: 1px solid #262626;
            border-radius: 8px;
            padding: 14px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 130px;
          }

          .stat-num {
            font-size: 22px;
            font-weight: 900;
            color: #f59e0b;
          }

          .stat-label {
            font-size: 10px;
            color: #8E8E93;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-top: 4px;
          }

          .section-title {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          }

          .section-title h2 {
            font-size: 18px;
            font-weight: 800;
            color: #FFFFFF;
            margin: 0;
          }

          .section-title span {
            font-size: 12px;
            color: #8E8E93;
            font-weight: 600;
          }

          .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
            gap: 20px;
          }

          .tool-card {
            background: #0a0a0a;
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 14px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            transition: all 0.2s ease;
          }

          .tool-card:hover {
            border-color: rgba(245, 158, 11, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.08);
          }

          .tool-card.featured {
            border-color: rgba(245, 158, 11, 0.3);
            background: linear-gradient(160deg, rgba(245, 158, 11, 0.06) 0%, #0a0a0a 100%);
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
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }

          /* Gold icon box — used for CRM (black on amber) */
          .tool-icon-box.gold {
            background: #f59e0b;
            color: #050505;
          }

          /* Amber-light icon box — used for supporting tools */
          .tool-icon-box.amber-light {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
          }

          /* Black on amber — CTA badge per BRAND.md §3 */
          .featured-badge {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            background: #f59e0b;
            color: #050505;
            padding: 3px 9px;
            border-radius: 20px;
          }

          .status-badge {
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 12px;
          }

          .status-badge.live {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
            border: 1px solid rgba(245,158,11,0.25);
          }

          .status-badge.upcoming {
            background: #141414;
            color: #8E8E93;
            border: 1px solid #262626;
          }

          .tool-name {
            font-size: 17px;
            font-weight: 800;
            color: #FFFFFF;
            margin: 0 0 8px;
          }

          .tool-desc {
            font-size: 13px;
            color: #8E8E93;
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
            background: #141414;
            color: #D1D5DB;
            padding: 3px 8px;
            border-radius: 4px;
            border: 1px solid #262626;
          }

          .tool-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.15s ease;
          }

          /* Black text on amber — the signature CTA per BRAND.md §3 */
          .btn-gold {
            background: #f59e0b;
            color: #050505;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: 2px solid #050505;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
          }

          .btn-gold:hover {
            background: #fbbf24;
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.3);
            transform: translateY(-1px);
          }

          .btn-gold:active {
            transform: scale(0.98);
          }

          .btn-secondary {
            background: transparent;
            color: #9ca3af;
            border: 1px solid #262626;
          }

          .btn-secondary:hover {
            color: #FFFFFF;
            border-color: rgba(245, 158, 11, 0.4);
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

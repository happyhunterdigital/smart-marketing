import { useState, useEffect } from 'react';
import { firebaseAuth, firestore } from '../lib/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface UserData {
  email: string;
  plan: 'free' | 'starter' | 'unlimited';
  gmapsQuota: number;
  createdAt: string;
}

// Brand-compliant SVG icons — no emojis in product UI per BRAND.md §5
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  crm: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  maps: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  jobs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  billing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  github: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);

      try {
        const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="loading-inner">
          <div className="spinner" />
          <span className="loading-label">Archiving digital dominance...</span>
        </div>
        <style jsx>{`
          .loading-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #050505;
            font-family: 'Inter', sans-serif;
          }
          .loading-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          .spinner {
            width: 36px;
            height: 36px;
            border: 2px solid rgba(251, 191, 36, 0.12);
            border-top-color: #f59e0b;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          .loading-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #9ca3af;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const currentPath = router.pathname;
  const quotaPct = Math.min(100, ((userData?.gmapsQuota ?? 200) / 200) * 100);

  return (
    <div className="dashboard-layout">
      {/* Ambient amber glow — fixed, pointer-events-none */}
      <div className="ambient-glow" aria-hidden="true" />

      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand header — wordmark per BRAND.md §2 */}
        <div className="brand-header">
          <div className="brand-emblem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L3 8v8l9 5 9-5V8L12 3z" fill="#050505" stroke="#050505" strokeWidth="1" />
              <path d="M12 3L3 8l9 5 9-5-9-5z" fill="#050505" />
            </svg>
          </div>
          <div className="brand-wordmark">
            {/* Wordmark: happy (white) + hunter (amber) + digital (gray) per BRAND.md §2 */}
            <span className="wm-happy">happy</span><span className="wm-hunter">hunter</span>
            <span className="wm-sub">Smart Marketing</span>
          </div>
        </div>

        {/* Nav: WORKSPACE */}
        <div className="nav-group-label">Workspace</div>
        <nav className="nav-menu">
          <Link
            href="/dashboard"
            className={`nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">{Icons.dashboard}</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/crm"
            className={`nav-item ${currentPath.startsWith('/dashboard/crm') ? 'active' : ''}`}
          >
            <span className="nav-icon">{Icons.crm}</span>
            <span>Happy Hunter CRM</span>
            <span className="badge-signal">Agentic</span>
          </Link>

          <Link
            href="/dashboard/gmaps-scraper"
            className={`nav-item ${currentPath.startsWith('/dashboard/gmaps-scraper') ? 'active' : ''}`}
          >
            <span className="nav-icon">{Icons.maps}</span>
            <span>Maps Scraper</span>
          </Link>

          <Link
            href="/dashboard/jobs"
            className={`nav-item ${currentPath.startsWith('/dashboard/jobs') ? 'active' : ''}`}
          >
            <span className="nav-icon">{Icons.jobs}</span>
            <span>My Jobs</span>
          </Link>

          <Link
            href="/dashboard/billing"
            className={`nav-item ${currentPath.startsWith('/dashboard/billing') ? 'active' : ''}`}
          >
            <span className="nav-icon">{Icons.billing}</span>
            <span>Billing</span>
          </Link>
        </nav>

        {/* Nav: AUTONOMOUS SUITE */}
        <div className="nav-group-label" style={{ marginTop: 24 }}>Autonomous Suite</div>
        <div className="upcoming-tools">
          {[
            { label: 'OpenReply — IG DM', status: 'Ready' },
            { label: 'OpenWA — WhatsApp', status: 'Ready' },
            { label: 'OpenMontage — Video', status: 'Soon' },
          ].map((tool) => (
            <div key={tool.label} className="upcoming-item">
              <span>{tool.label}</span>
              <span className={`badge-status ${tool.status === 'Soon' ? 'soon' : 'ready'}`}>
                {tool.status}
              </span>
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-avatar">
              {user.email ? user.email.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="user-info">
              <span className="user-email" title={user.email}>{user.email}</span>
              <span className="user-plan">{userData?.plan ? userData.plan.toUpperCase() : 'FREE'}</span>
            </div>
          </div>

          <div className="quota-card">
            <div className="quota-header">
              <span className="quota-label">Searches Remaining</span>
              <strong className="quota-value">{userData?.gmapsQuota ?? 200}</strong>
            </div>
            <div className="quota-track">
              <div className="quota-fill" style={{ width: `${quotaPct}%` }} />
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn" id="sidebar-logout-btn">
            <span>{Icons.logout}</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="top-nav">
          <div className="breadcrumbs">
            <span className="bc-root">Happy Hunter Digital</span>
            <span className="bc-sep">/</span>
            <span className="bc-current">
              {currentPath === '/dashboard' ? 'Overview' :
               currentPath.startsWith('/dashboard/crm') ? 'Happy Hunter CRM' :
               currentPath.startsWith('/dashboard/gmaps-scraper') ? 'Maps Scraper' :
               currentPath.startsWith('/dashboard/jobs') ? 'Jobs' :
               currentPath.startsWith('/dashboard/billing') ? 'Billing' : 'Dashboard'}
            </span>
          </div>
          <a
            href="https://github.com/happyhunterdigital/crm"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            id="top-nav-github-link"
          >
            {Icons.github}
            <span>happyhunterdigital/crm</span>
          </a>
        </header>

        <div className="content-container">
          {children}
        </div>
      </main>

      <style jsx>{`
        /* === Layout === */
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #050505;
          color: #FFFFFF;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
        }

        /* Ambient glow — BRAND.md §6 */
        .ambient-glow {
          position: fixed;
          top: -300px;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.05) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
          animation: glow-drift 12s ease-in-out infinite alternate;
        }

        @keyframes glow-drift {
          from { opacity: 0.6; transform: translateX(-50%) translateY(0); }
          to   { opacity: 1;   transform: translateX(-50%) translateY(30px); }
        }

        /* === Sidebar === */
        .sidebar {
          width: 256px;
          background: #0a0a0a;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 20px 14px;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }

        /* === Brand wordmark === */
        .brand-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          padding: 0 4px;
        }

        .brand-emblem {
          width: 34px;
          height: 34px;
          background: #f59e0b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(251, 191, 36, 0.35);
          flex-shrink: 0;
        }

        .brand-wordmark {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        /* Wordmark line 1: happy (white bold) + hunter (amber bold) */
        .wm-happy {
          font-size: 15px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .wm-hunter {
          font-size: 15px;
          font-weight: 800;
          color: #f59e0b;
          letter-spacing: -0.01em;
        }

        /* Wordmark line 2: "Smart Marketing" in gray — per §2 quiet context */
        .wm-sub {
          display: block;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #6b7280;
          margin-top: 3px;
        }

        /* === Nav group label — forensic mono label per BRAND.md §4 === */
        .nav-group-label {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #6b7280;
          padding: 0 6px;
          margin-bottom: 6px;
        }

        /* === Nav items === */
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          color: #9ca3af;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.15s ease;
          border: 1px solid transparent;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.04);
          color: #FFFFFF;
          border-color: rgba(255,255,255,0.06);
        }

        .nav-item.active {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-left: 2px solid #f59e0b;
          border-color: rgba(245, 158, 11, 0.2);
          font-weight: 600;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .nav-item.active .nav-icon {
          opacity: 1;
        }

        /* Agentic badge — black on amber per BRAND.md §3 */
        .badge-signal {
          margin-left: auto;
          background: #f59e0b;
          color: #050505;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* === Upcoming tools === */
        .upcoming-tools {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 2px;
        }

        .upcoming-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          font-size: 11.5px;
          color: #6b7280;
          border-radius: 6px;
        }

        .badge-status {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .badge-status.ready {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .badge-status.soon {
          background: #1A1A1A;
          color: #6b7280;
          border: 1px solid #262626;
        }

        /* === Sidebar footer === */
        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .user-profile-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: #141414;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: #f59e0b;
          color: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 13px;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-email {
          font-size: 11.5px;
          font-weight: 600;
          color: #FFFFFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-plan {
          font-size: 9px;
          color: #f59e0b;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 800;
          margin-top: 1px;
        }

        .quota-card {
          background: #141414;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .quota-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .quota-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #6b7280;
        }

        .quota-value {
          font-size: 13px;
          font-weight: 800;
          color: #FFFFFF;
        }

        .quota-track {
          height: 3px;
          background: #262626;
          border-radius: 2px;
          overflow: hidden;
        }

        .quota-fill {
          height: 100%;
          background: linear-gradient(to right, #f59e0b, #f97316);
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.06);
          color: #6b7280;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: 0.02em;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.25);
        }

        /* === Main content === */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          background: #050505;
          position: relative;
          z-index: 1;
        }

        /* Floating top nav — per BRAND.md §7 */
        .top-nav {
          height: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: rgba(10,10,15,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
        }

        .bc-root {
          color: #6b7280;
          font-weight: 600;
        }

        .bc-sep {
          color: #374151;
        }

        .bc-current {
          color: #FFFFFF;
          font-weight: 700;
        }

        /* GitHub badge — amber on dark per brand */
        .github-link {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 6px 14px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 0.02em;
          transition: all 0.15s ease;
        }

        .github-link:hover {
          background: rgba(245, 158, 11, 0.15);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }

        .content-container {
          padding: 36px 40px;
          max-width: 1360px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

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
        <div className="spinner"></div>
        <p>Architecting digital dominance...</p>
        <style jsx>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #050505;
            color: #8E8E93;
            font-family: 'Inter', sans-serif;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(234, 179, 8, 0.15);
            border-radius: 50%;
            border-top-color: #EAB308;
            animation: spin 0.8s ease-in-out infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const currentPath = router.pathname;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#050505" />
            </svg>
            <span className="logo-symbol">🧠</span>
          </div>
          <div className="brand-titles">
            <h3 className="brand-title">HAPPY HUNTER</h3>
            <span className="brand-subtitle">SMART MARKETING</span>
          </div>
        </div>

        <div className="nav-group-label">WORKSPACE</div>
        <nav className="nav-menu">
          <Link
            href="/dashboard"
            className={`nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard Hub</span>
          </Link>

          <Link
            href="/dashboard/crm"
            className={`nav-item ${currentPath.startsWith('/dashboard/crm') ? 'active' : ''}`}
          >
            <span className="nav-icon">⚡</span>
            <span>Happy Hunter CRM</span>
            <span className="badge-gold">Agentic</span>
          </Link>

          <Link
            href="/dashboard/gmaps-scraper"
            className={`nav-item ${currentPath.startsWith('/dashboard/gmaps-scraper') ? 'active' : ''}`}
          >
            <span className="nav-icon">📍</span>
            <span>Google Maps Scraper</span>
          </Link>

          <Link
            href="/dashboard/jobs"
            className={`nav-item ${currentPath.startsWith('/dashboard/jobs') ? 'active' : ''}`}
          >
            <span className="nav-icon">📑</span>
            <span>My Jobs</span>
          </Link>

          <Link
            href="/dashboard/billing"
            className={`nav-item ${currentPath.startsWith('/dashboard/billing') ? 'active' : ''}`}
          >
            <span className="nav-icon">💳</span>
            <span>Billing & Plans</span>
          </Link>
        </nav>

        <div className="nav-group-label">AUTONOMOUS SUITE</div>
        <div className="upcoming-tools">
          <div className="upcoming-item">
            <span>💬 OpenReply (IG DM)</span>
            <span className="badge-soon">Ready</span>
          </div>
          <div className="upcoming-item">
            <span>📱 OpenWA (WhatsApp)</span>
            <span className="badge-soon">Ready</span>
          </div>
          <div className="upcoming-item">
            <span>🎬 OpenMontage (Video)</span>
            <span className="badge-soon">Ready</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-avatar">
              {user.email ? user.email.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="user-info">
              <span className="user-email" title={user.email}>{user.email}</span>
              <span className="user-plan">Plan: {userData?.plan ? userData.plan.toUpperCase() : 'FREE'}</span>
            </div>
          </div>

          <div className="quota-indicator">
            <div className="quota-header">
              <span>Searches Left</span>
              <strong>{userData?.gmapsQuota ?? 200}</strong>
            </div>
            <div className="quota-bar">
              <div
                className="quota-bar-fill"
                style={{ width: `${Math.min(100, ((userData?.gmapsQuota ?? 200) / 200) * 100)}%` }}
              ></div>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-nav">
          <div className="breadcrumbs">
            <span className="breadcrumb-root">Happy Hunter Digital</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">
              {currentPath === '/dashboard' ? 'Overview' :
               currentPath.startsWith('/dashboard/crm') ? 'Happy Hunter CRM' :
               currentPath.startsWith('/dashboard/gmaps-scraper') ? 'Google Maps Scraper' :
               currentPath.startsWith('/dashboard/jobs') ? 'Jobs Center' :
               currentPath.startsWith('/dashboard/billing') ? 'Billing & Subscriptions' : 'Dashboard'}
            </span>
          </div>
          <div className="top-nav-actions">
            <a
              href="https://github.com/happyhunterdigital/crm"
              target="_blank"
              rel="noopener noreferrer"
              className="github-badge-link"
            >
              ⭐ happyhunterdigital/crm
            </a>
          </div>
        </header>

        <div className="content-container">
          {children}
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #050505;
          color: #FFFFFF;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .sidebar {
          width: 270px;
          background: #0D0D0D;
          border-right: 1px solid #1F1F1F;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          flex-shrink: 0;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 0 6px;
        }

        .brand-logo-icon {
          width: 36px;
          height: 36px;
          background: #EAB308;
          color: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          box-shadow: 0 0 16px rgba(234, 179, 8, 0.4);
          font-size: 18px;
          position: relative;
        }

        .brand-titles {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 15px;
          font-weight: 800;
          margin: 0;
          color: #FFFFFF;
          letter-spacing: 0.5px;
        }

        .brand-subtitle {
          font-size: 10px;
          color: #EAB308;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 700;
        }

        .nav-group-label {
          font-size: 10px;
          color: #8E8E93;
          font-weight: 800;
          letter-spacing: 1.2px;
          margin: 16px 8px 8px;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          color: #D1D5DB;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.15s ease;
          border: 1px solid transparent;
        }

        .nav-item:hover {
          background: #141414;
          color: #FFFFFF;
          border-color: #262626;
        }

        .nav-item.active {
          background: rgba(234, 179, 8, 0.1);
          color: #EAB308;
          border-left: 3px solid #EAB308;
          border-color: rgba(234, 179, 8, 0.25);
          font-weight: 600;
        }

        .nav-icon {
          font-size: 16px;
        }

        .badge-gold {
          margin-left: auto;
          background: #EAB308;
          color: #050505;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .upcoming-tools {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0 4px;
        }

        .upcoming-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          font-size: 12px;
          color: #8E8E93;
        }

        .badge-soon {
          background: #1A1A1A;
          color: #EAB308;
          border: 1px solid rgba(234, 179, 8, 0.2);
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #1F1F1F;
        }

        .user-profile-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: #141414;
          border-radius: 8px;
          border: 1px solid #262626;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #EAB308;
          color: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-email {
          font-size: 12px;
          font-weight: 600;
          color: #FFFFFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-plan {
          font-size: 10px;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 700;
        }

        .quota-indicator {
          background: #141414;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #262626;
        }

        .quota-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #8E8E93;
          margin-bottom: 6px;
        }

        .quota-bar {
          height: 4px;
          background: #262626;
          border-radius: 2px;
          overflow: hidden;
        }

        .quota-bar-fill {
          height: 100%;
          background: #EAB308;
          border-radius: 2px;
        }

        .logout-btn {
          background: transparent;
          border: 1px solid #262626;
          color: #8E8E93;
          padding: 8px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-weight: 600;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
          border-color: #EF4444;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          background: #050505;
        }

        .top-nav {
          height: 64px;
          border-bottom: 1px solid #1F1F1F;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: rgba(13, 13, 13, 0.85);
          backdrop-filter: blur(12px);
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #8E8E93;
        }

        .breadcrumb-root {
          color: #8E8E93;
          font-weight: 600;
        }

        .breadcrumb-separator {
          color: #333333;
        }

        .breadcrumb-current {
          color: #FFFFFF;
          font-weight: 700;
        }

        .github-badge-link {
          font-size: 12px;
          color: #EAB308;
          background: rgba(234, 179, 8, 0.1);
          border: 1px solid rgba(234, 179, 8, 0.3);
          padding: 6px 14px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.15s ease;
        }

        .github-badge-link:hover {
          background: rgba(234, 179, 8, 0.2);
          color: #FFFFFF;
          box-shadow: 0 0 12px rgba(234, 179, 8, 0.3);
        }

        .content-container {
          padding: 32px;
          max-width: 1300px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

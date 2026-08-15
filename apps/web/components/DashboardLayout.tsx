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
        <p>Loading Happy Hunter Digital Suite...</p>
        <style jsx>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #0f172a;
            color: #94a3b8;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top-color: #38bdf8;
            animation: spin 1s ease-in-out infinite;
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
          <div className="brand-badge">HH</div>
          <div>
            <h3 className="brand-title">Happy Hunter</h3>
            <span className="brand-subtitle">Marketing Cloud</span>
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
            <span className="badge-new">Agentic</span>
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

        <div className="nav-group-label">UPCOMING TOOLS</div>
        <div className="upcoming-tools">
          <div className="upcoming-item">
            <span>💬 OpenReply (IG DM)</span>
            <span className="badge-soon">Soon</span>
          </div>
          <div className="upcoming-item">
            <span>📱 OpenWA (WhatsApp)</span>
            <span className="badge-soon">Soon</span>
          </div>
          <div className="upcoming-item">
            <span>🎬 OpenMontage (Video)</span>
            <span className="badge-soon">Soon</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-avatar">
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-email" title={user.email}>{user.email}</span>
              <span className="user-plan">Plan: {userData?.plan || 'Free Tier'}</span>
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
            <span>Happy Hunter Digital</span>
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
              ⭐ GitHub: happyhunterdigital/crm
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
          background: #090d16;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .sidebar {
          width: 270px;
          background: #0f172a;
          border-right: 1px solid #1e293b;
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
          padding: 0 8px;
        }

        .brand-badge {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: white;
          font-weight: 800;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }

        .brand-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: #f8fafc;
          letter-spacing: -0.3px;
        }

        .brand-subtitle {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
        }

        .nav-group-label {
          font-size: 10px;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 1px;
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
          color: #94a3b8;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .nav-item:hover {
          background: #1e293b;
          color: #f8fafc;
        }

        .nav-item.active {
          background: rgba(14, 165, 233, 0.15);
          color: #38bdf8;
          border-left: 3px solid #38bdf8;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 16px;
        }

        .badge-new {
          margin-left: auto;
          background: linear-gradient(135deg, #0284c7, #2563eb);
          color: white;
          font-size: 9px;
          font-weight: 700;
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
          color: #64748b;
        }

        .badge-soon {
          background: #1e293b;
          color: #94a3b8;
          font-size: 9px;
          padding: 2px 5px;
          border-radius: 3px;
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #1e293b;
        }

        .user-profile-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: #1e293b;
          border-radius: 8px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #38bdf8;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-email {
          font-size: 12px;
          font-weight: 600;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-plan {
          font-size: 10px;
          color: #38bdf8;
          text-transform: uppercase;
          font-weight: 600;
        }

        .quota-indicator {
          background: rgba(30, 41, 59, 0.5);
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #1e293b;
        }

        .quota-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .quota-bar {
          height: 4px;
          background: #334155;
          border-radius: 2px;
          overflow: hidden;
        }

        .quota-bar-fill {
          height: 100%;
          background: #38bdf8;
          border-radius: 2px;
        }

        .logout-btn {
          background: transparent;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 8px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: #ef4444;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .top-nav {
          height: 60px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }

        .breadcrumb-separator {
          color: #334155;
        }

        .breadcrumb-current {
          color: #f8fafc;
          font-weight: 600;
        }

        .github-badge-link {
          font-size: 12px;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          padding: 6px 12px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .github-badge-link:hover {
          background: rgba(56, 189, 248, 0.2);
          color: #7dd3fc;
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

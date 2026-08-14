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
      
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <nav>
          <ul>
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/dashboard/gmaps-scraper">Google Maps Scraper</Link>
            </li>
            <li>
              <Link href="/dashboard/jobs">My Jobs</Link>
            </li>
            <li>
              <Link href="/dashboard/billing">Billing</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </nav>

        <div className="quota-display">
          <h4>Google Maps Searches Remaining: {userData?.gmapsQuota ?? '...'}</h4>
          <p>Plan: {userData?.plan ?? 'Loading...'}</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 250px;
          background: #f5f5f5;
          padding: 20px;
        }
        .sidebar nav ul {
          list-style: none;
          padding: 0;
        }
        .sidebar nav ul li {
          margin-bottom: 10px;
        }
        .sidebar a {
          display: block;
          padding: 8px 12px;
          text-decoration: none;
          color: #333;
          border-radius: 4px;
        }
        .sidebar a:hover {
          background: #e0e0e0;
        }
        .main-content {
          flex: 1;
          padding: 20px;
        }
        .quota-display {
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

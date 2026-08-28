// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firebaseAuth } from '../lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import dynamic from 'next/dynamic';
const Chatbot = dynamic(() => import('../components/Chatbot').then(m => m.Chatbot), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, loading] = useAuthState(firebaseAuth);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize
    if (!loading) {
      setAppReady(true);
    }
  }, [loading]);

  // Public pages that don't require auth
  const publicPaths = ['/', '/login', '/signup', '/reset-password'];
  const isPublicPage = publicPaths.includes(router.pathname);

  // Show loading state
  if (loading || !appReady) {
    return (
      <div className="global-loader">
        <div className="loader-ring"></div>
        <span className="loader-brand">HAPPY HUNTER DIGITAL</span>
        <style jsx>{`
          .global-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #050505;
            color: #EAB308;
            font-family: 'Inter', sans-serif;
            gap: 16px;
          }
          .loader-ring {
            width: 44px;
            height: 44px;
            border: 3px solid rgba(234, 179, 8, 0.15);
            border-radius: 50%;
            border-top-color: #EAB308;
            animation: spin 0.8s ease-in-out infinite;
          }
          .loader-brand {
            font-size: 11px;
            letter-spacing: 2px;
            font-weight: 800;
            color: #8E8E93;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if accessing protected page while not logged in
  if (!user && !isPublicPage && typeof window !== 'undefined') {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Component {...pageProps} />
      <Chatbot />
    </>
  );
}

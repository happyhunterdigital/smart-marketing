// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firebaseAuth } from '../src/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

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
  const publicPaths = ['/login', '/signup', '/reset-password'];
  const isPublicPage = publicPaths.includes(router.pathname);

  // Show loading state
  if (loading || !appReady) {
    return <div>Loading...</div>;
  }

  // Redirect to login if accessing protected page while not logged in
  if (!user && !isPublicPage && typeof window !== 'undefined') {
    router.push('/login');
    return null;
  }

  return <Component {...pageProps} />;
}

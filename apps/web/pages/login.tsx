import { useState } from 'react';
import { firebaseAuth, firestore } from '../lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const redirectAfterAuth = async (uid: string) => {
    try {
      const snap = await getDoc(doc(firestore, 'users', uid));
      const data = snap.data();
      if (!data?.role) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await setDoc(doc(firestore, 'users', userCred.user.uid), {
          email: userCred.user.email,
          plan: 'free',
          gmapsQuota: 200,
          role: null,
          createdAt: new Date().toISOString(),
        });
        await redirectAfterAuth(userCred.user.uid);
      } else {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        await redirectAfterAuth(cred.user.uid);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const userRef = doc(firestore, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          plan: 'free',
          gmapsQuota: 200,
          role: null,
          createdAt: new Date().toISOString(),
        });
        router.push('/onboarding');
      } else {
        await redirectAfterAuth(result.user.uid);
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 py-10 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 900px 600px at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 62%)' }} aria-hidden="true" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img src="https://res.cloudinary.com/dkyg07qvv/image/upload/v1780206015/favicon_jafn1r.jpg" alt="" width={32} height={32} className="rounded-lg shadow-[0_0_18px_rgba(251,191,36,0.3)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">happyhunterdigital</span>
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-8 shadow-[0_0_40px_rgba(251,191,36,0.08)]">
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              {isRegistering ? 'Create account' : 'Welcome back'}
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white" style={{ fontFamily: 'CalSans, Inter, sans-serif' }}>
              {isRegistering ? 'Create your workspace' : 'Sign in to continue'}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              {isRegistering ? 'Email + Google supported. Roles chosen next.' : 'Use email or continue with Google.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.co.za"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`w-full rounded-xl py-3 text-sm font-black uppercase tracking-widest transition-all ${
                loading || !email || !password
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98] shadow-[0_0_20px_rgba(251,191,36,0.2)]'
              }`}
            >
              {loading ? 'Please wait…' : isRegistering ? 'Create account →' : 'Sign in →'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.001-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-semibold text-zinc-400 hover:text-amber-500">
              {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Create one'}
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
              Firebase Auth: enable <b>Email/Password</b> + <b>Google</b> in console. Set Project public name to <b>happyhunterdigital</b> and support email <b>happyhunterdigital@gmail.com</b> (seen in your screenshot).
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          By continuing you agree to our terms. Roles are saved to <code className="rounded bg-white/10 px-1 py-0.5">users/{'{uid}'}.role</code>.
        </p>
      </div>
    </div>
  );
}

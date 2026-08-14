import { useState } from 'react';
import { firebaseAuth, firestore } from '../lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRegistering) {
        // Register new user
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        
        // Initialize user record in Firestore with free plan
        await setDoc(doc(firestore, 'users', userCred.user.uid), {
          email: userCred.user.email,
          plan: 'free',
          gmapsQuota: 200,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Login existing user
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);

      // Create Firestore user doc if first time
      const userRef = doc(firestore, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          plan: 'free',
          gmapsQuota: 200,
          createdAt: new Date().toISOString(),
        });
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Google auth error:', error);
      alert(error instanceof Error ? error.message : 'Google sign-in failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isRegistering ? 'Sign Up' : 'Login'}</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">
            {isRegistering ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="divider"><span>or</span></div>
        <button type="button" onClick={handleGoogleSignIn} className="google-btn">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.001-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
          Sign in with Google
        </button>
        <button 
          type="button" 
          onClick={() => setIsRegistering(!isRegistering)}
          className="toggle-btn"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .auth-card {
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        div {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #0050c3;
        }
        .toggle-btn {
          background: none;
          color: #0070f3;
          margin-top: 15px;
        }
        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
        }
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #ddd;
        }
        .divider span {
          background: white;
          padding: 0 12px;
          position: relative;
          color: #888;
          font-size: 14px;
        }
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: white;
          color: #333;
          border: 1px solid #ccc;
          font-size: 15px;
          font-weight: 500;
        }
        .google-btn:hover {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
}

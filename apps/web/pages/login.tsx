import { useState } from 'react';
import { firebaseAuth } from '../lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase/config';

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
      `}</style>
    </div>
  );
}

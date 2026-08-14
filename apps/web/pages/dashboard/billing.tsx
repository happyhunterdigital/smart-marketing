import DashboardLayout from '../components/DashboardLayout';
import { useState, useEffect } from 'react';
import { firebaseAuth, firestore } from '../lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function Billing() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0/month',
      features: [
        '200 searches/month',
        'Up to 1,000 results per search',
        'Fast & Fastest search strategies',
      ],
      limitations: [
        'No enrichment',
        'No detailed/zoom search strategies',
        'No server deployment',
      ],
      stripePriceId: null,
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '$16/month',
      features: [
        '5,000 searches/month',
        'Up to 1,000+ results per search',
        'All search strategies',
        '50+ data points extracted',
      ],
      stripePriceId: 'price_starter_monthly',
      popular: true,
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '$48/month',
      features: [
        'Unlimited searches',
        'Up to 10,000+ results per search',
        'All search strategies',
        '50+ data points extracted',
        'Enrichment included',
      ],
      stripePriceId: 'price_unlimited_monthly',
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseAuth.currentUser) {
        const userDoc = await getDoc(doc(firestore, 'users', firebaseAuth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleCheckout = async (priceId: string) => {
    if (!firebaseAuth.currentUser) return;

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: firebaseAuth.currentUser.uid,
        }),
      });

      const data = await response.json();
      
      if (data.sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await getStripe();
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Failed to start checkout process');
    }
  };

  // Lazy load Stripe
  const getStripe = async () => {
    const { loadStripe } = await import('@stripe/stripe-js');
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!) as any;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p>Loading billing info...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1>Pricing</h1>
        
        <p>Your current plan: <strong>{userData?.plan || 'Free'}</strong></p>
        <p>Google Maps searches remaining: <strong>{userData?.gmapsQuota || 0}</strong></p>

        <div className="plans">
          {plans.map((plan) => (
            <div key={plan.id} className={`plan ${plan.popular ? 'popular' : ''}`}>
              <h2>{plan.name}</h2>
              <p className="price">{plan.price}</p>
              
              <h3>Features</h3>
              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
              
              {plan.limitations && (
                <>
                  <h3>Limitations</h3>
                  <ul className="limitations">
                    {plan.limitations.map((limitation, i) => (
                      <li key={i}>✗ {limitation}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {plan.stripePriceId && (
                <button 
                  onClick={() => handleCheckout(plan.stripePriceId!)}
                  className={plan.popular ? 'primary' : ''}
                >
                  Get {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .plans {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .plan {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .popular {
          border: 2px solid #0070f3;
        }
        .price {
          font-size: 2em;
          font-weight: bold;
          margin: 10px 0;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: 8px;
        }
        .limitations {
          color: #999;
        }
        button {
          margin-top: 15px;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button.primary {
          background: #0070f3;
          color: white;
        }
      `}</style>
    </DashboardLayout>
  );
}

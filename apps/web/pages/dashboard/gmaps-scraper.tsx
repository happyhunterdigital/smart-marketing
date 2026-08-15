import DashboardLayout from '../../components/DashboardLayout';
import { useState } from 'react';
import { firebaseAuth, firestore } from '../../lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export default function GmapsScraper() {
  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useState<'Fast' | 'Fastest' | 'Detailed' | 'Zoom15' | 'Zoom16' | 'Zoom17' | 'Zoom18' | 'Geolocation'>('Fast');
  const [maxResults, setMaxResults] = useState('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);

    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      setError('Authentication required. Please log in.');
      setIsSubmitting(false);
      return;
    }

    try {
      // First try API route, fallback directly to Firestore if running in static export
      let jobCreated = false;
      let createdJobId = '';

      try {
        const response = await fetch('/api/scrape-gmaps', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.uid}`
          },
          body: JSON.stringify({
            query,
            strategy,
            maxResults: parseInt(maxResults),
          }),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok) {
            setResult(data);
            jobCreated = true;
          } else {
            throw new Error(data.error || 'Failed to create job via API');
          }
        }
      } catch (apiErr) {
        // Fall back directly to Firestore client SDK (static hosting mode)
        console.log('API route not available in static export mode, using direct Firestore client SDK...');
      }

      if (!jobCreated) {
        // Direct Firestore creation
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          throw new Error('User profile record not found.');
        }

        const userData = userDoc.data();
        const currentQuota = userData.gmapsQuota ?? 200;

        if (currentQuota <= 0) {
          throw new Error('Search quota exhausted. Please upgrade your plan under Billing.');
        }

        createdJobId = `${currentUser.uid}_${Date.now()}`;
        const timestamp = new Date().toISOString();

        await setDoc(doc(firestore, 'jobs', createdJobId), {
          id: createdJobId,
          userId: currentUser.uid,
          tool: 'google-maps-scraper',
          query: query,
          strategy: strategy,
          maxResults: parseInt(maxResults),
          status: 'pending',
          createdAt: timestamp,
          resultUrl: null,
          error: null,
        });

        // Decrement quota in Firestore
        await updateDoc(userRef, {
          gmapsQuota: currentQuota - 1,
        });

        setResult({
          jobId: createdJobId,
          message: 'Job created successfully',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating extraction job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="scraper-page">
        <div className="page-header">
          <div>
            <div className="category-tag">DATA SOVEREIGNTY · LEAD EXTRACTION</div>
            <h1 className="page-title">Google Maps Lead Scraper</h1>
            <p className="page-subtitle">
              Extract high-intent local business leads, verified contacts, ratings, and social profiles with mathematical certainty.
            </p>
          </div>
          <a
            href="https://github.com/happyhunterdigital/google-maps-scraper"
            target="_blank"
            rel="noopener noreferrer"
            className="repo-link"
          >
            ⭐ happyhunterdigital/google-maps-scraper
          </a>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="scraper-form">
            <div className="form-group">
              <label>Search Query & Target Location</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Solar installers in Johannesburg or Real estate agencies in Cape Town"
                required
              />
              <span className="field-hint">Specify location and business sector for optimal entity matching.</span>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Extraction Strategy</label>
                <select value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
                  <option value="Fast">Fast (Default) — 120–1,600 results per city (1–10 min)</option>
                  <option value="Fastest">Fastest — ~30s per city, speed priority</option>
                  <option value="Detailed">Detailed — Highest coverage per single city</option>
                  <option value="Zoom15">Zoom Level 15 — Neighborhood Level</option>
                  <option value="Zoom16">Zoom Level 16 — Sub-Neighborhood Level</option>
                  <option value="Zoom17">Zoom Level 17 — Block Level (Deep Search)</option>
                  <option value="Zoom18">Zoom Level 18 — Street Level (Maximum Depth)</option>
                  <option value="Geolocation">Geolocation — Custom GeoJSON Polygon Area</option>
                </select>
              </div>

              <div className="form-group width-220">
                <label>Max Results Limit</label>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(e.target.value)}
                  min="1"
                  max="50000"
                  required
                />
              </div>
            </div>

            {strategy === 'Geolocation' && (
              <div className="info-box">
                <p>
                  Draw your search area polygon at{' '}
                  <a href="https://geojson.io/" target="_blank" rel="noopener noreferrer">
                    geojson.io
                  </a>{' '}
                  and specify custom boundaries.
                </p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Architecting Extraction Job...' : '🚀 Start Google Maps Scraping Job'}
            </button>
          </form>

          {error && (
            <div className="alert-box error">
              <span>⚠️ {error}</span>
            </div>
          )}

          {result && (
            <div className="alert-box success">
              <h3>Job Created Successfully!</h3>
              <p><strong>Job ID:</strong> {result.jobId}</p>
              <p>
                Your extraction is queued in background workers. Monitor progress in{' '}
                <a href="/dashboard/jobs">My Jobs Center →</a>
              </p>
            </div>
          )}
        </div>

        <style jsx>{`
          .scraper-page {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .category-tag {
            font-size: 11px;
            font-weight: 800;
            color: #EAB308;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 6px;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .page-title {
            font-size: 26px;
            font-weight: 800;
            color: #FFFFFF;
            margin: 0 0 6px;
            letter-spacing: -0.5px;
          }

          .page-subtitle {
            font-size: 13.5px;
            color: #8E8E93;
            margin: 0;
            max-width: 680px;
          }

          .repo-link {
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

          .repo-link:hover {
            background: rgba(234, 179, 8, 0.2);
            color: #FFFFFF;
          }

          .card {
            background: #0D0D0D;
            border: 1px solid #1F1F1F;
            border-radius: 12px;
            padding: 28px;
          }

          .scraper-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .form-row {
            display: flex;
            gap: 16px;
          }

          .flex-1 { flex: 1; }
          .width-220 { width: 220px; }

          label {
            font-size: 13px;
            font-weight: 700;
            color: #FFFFFF;
          }

          .field-hint {
            font-size: 11px;
            color: #8E8E93;
          }

          input, select {
            background: #141414;
            border: 1px solid #262626;
            color: #FFFFFF;
            padding: 12px 14px;
            border-radius: 8px;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            transition: border-color 0.15s ease;
          }

          input:focus, select:focus {
            outline: none;
            border-color: #EAB308;
            box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
          }

          .info-box {
            background: rgba(234, 179, 8, 0.08);
            border: 1px solid rgba(234, 179, 8, 0.25);
            border-radius: 8px;
            padding: 12px 16px;
            color: #EAB308;
            font-size: 12.5px;
          }

          .info-box a {
            color: #FFFFFF;
            text-decoration: underline;
            font-weight: 600;
          }

          .submit-btn {
            background: #EAB308;
            color: #050505;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 0.3px;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.35);
          }

          .submit-btn:hover {
            background: #ca8a04;
            transform: translateY(-1px);
            box-shadow: 0 0 20px rgba(234, 179, 8, 0.5);
          }

          .submit-btn:disabled {
            background: #1F1F1F;
            color: #8E8E93;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .alert-box {
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
          }

          .alert-box.error {
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid #EF4444;
            color: #FCA5A5;
            font-size: 13px;
            font-weight: 500;
          }

          .alert-box.success {
            background: rgba(234, 179, 8, 0.12);
            border: 1px solid #EAB308;
            color: #FFFFFF;
          }

          .alert-box.success h3 {
            margin: 0 0 6px;
            font-size: 15px;
            color: #EAB308;
            font-weight: 800;
          }

          .alert-box.success p {
            margin: 4px 0;
            font-size: 13px;
          }

          .alert-box.success a {
            color: #EAB308;
            font-weight: 700;
            text-decoration: underline;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

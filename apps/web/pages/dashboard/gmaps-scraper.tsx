import DashboardLayout from '../../components/DashboardLayout';
import { useState } from 'react';
import { firebaseAuth } from '../../lib/firebase/config';

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

    try {
      const response = await fetch('/api/scrape-gmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseAuth.currentUser?.uid}`
        },
        body: JSON.stringify({
          query,
          strategy,
          maxResults: parseInt(maxResults),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="scraper-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Google Maps Lead Scraper</h1>
            <p className="page-subtitle">
              Extract high-intent local business leads, verified contacts, ratings, and social profiles directly from Google Maps.
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
                placeholder="e.g., HVAC contractors in Austin, TX or Italian restaurants in London"
                required
              />
              <span className="field-hint">Tip: Include city and category for best matching.</span>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Extraction Strategy</label>
                <select value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
                  <option value="Fast">Fast (Default) — 120–1,600 results per city (1–10 min)</option>
                  <option value="Fastest">Fastest — ~30s per city, speed optimized</option>
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
              {isSubmitting ? 'Initializing Extraction Job...' : '🚀 Start Google Maps Scraping Job'}
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

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .page-title {
            font-size: 24px;
            font-weight: 800;
            color: #f8fafc;
            margin: 0 0 6px;
          }

          .page-subtitle {
            font-size: 13.5px;
            color: #94a3b8;
            margin: 0;
          }

          .repo-link {
            font-size: 12px;
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.1);
            border: 1px solid rgba(56, 189, 248, 0.2);
            padding: 6px 12px;
            border-radius: 20px;
            text-decoration: none;
            font-weight: 500;
          }

          .card {
            background: #0f172a;
            border: 1px solid #1e293b;
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
            font-weight: 600;
            color: #e2e8f0;
          }

          .field-hint {
            font-size: 11px;
            color: #64748b;
          }

          input, select {
            background: #1e293b;
            border: 1px solid #334155;
            color: #f8fafc;
            padding: 12px 14px;
            border-radius: 8px;
            font-size: 14px;
          }

          input:focus, select:focus {
            outline: none;
            border-color: #38bdf8;
          }

          .info-box {
            background: rgba(56, 189, 248, 0.08);
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 8px;
            padding: 12px 16px;
            color: #7dd3fc;
            font-size: 12.5px;
          }

          .info-box a {
            color: #38bdf8;
            text-decoration: underline;
          }

          .submit-btn {
            background: linear-gradient(135deg, #0284c7, #2563eb);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: 0 2px 10px rgba(37, 99, 235, 0.4);
          }

          .submit-btn:hover {
            opacity: 0.95;
            transform: translateY(-1px);
          }

          .submit-btn:disabled {
            background: #334155;
            color: #64748b;
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
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
          }

          .alert-box.success {
            background: rgba(34, 197, 94, 0.15);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #86efac;
          }

          .alert-box.success h3 {
            margin: 0 0 6px;
            font-size: 15px;
            color: #4ade80;
          }

          .alert-box.success p {
            margin: 4px 0;
            font-size: 13px;
          }

          .alert-box.success a {
            color: #38bdf8;
            font-weight: 600;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

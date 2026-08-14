import DashboardLayout from '../../components/DashboardLayout';
import { useState } from 'react';
import { firebaseAuth, firestore } from '../../lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

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
      const token = await firebaseAuth.currentUser?.getIdToken();
      
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
      <div>
        <h1>Google Maps Scraper</h1>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Search Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., restaurants in New York"
              required
            />
          </div>

          <div>
            <label>Search Strategy</label>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
              <option value="Fast">Fast (Default) - 120-1600 results per city</option>
              <option value="Fastest">Fastest - ~30 seconds per city, ~40 fewer results</option>
              <option value="Detailed">Detailed - More results than Fast, longer time</option>
              <option value="Zoom15">Zoom Level 15 - Neighborhood Level</option>
              <option value="Zoom16">Zoom Level 16 - Sub-Neighborhood Level</option>
              <option value="Zoom17">Zoom Level 17 - Block Level (time consuming)</option>
              <option value="Zoom18">Zoom Level 18 - Street Level (very time consuming)</option>
              <option value="Geolocation">Geolocation - Custom area via GeoJSON</option>
            </select>
          </div>

          {strategy === 'Geolocation' && (
            <div>
              <p>
                Draw your search area at{' '}
                <a href="https://geojson.io/" target="_blank" rel="noopener noreferrer">
                  geojson.io
                </a>
                {' '}(will add GeoJSON input field in future version)
              </p>
            </div>
          )}

          <div>
            <label>Max Results Per City</label>
            <input
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value)}
              min="1"
              max="50000"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Job...' : 'Start Scraping Job'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="success">
            <h2>Job Created Successfully!</h2>
            <p><strong>Job ID:</strong> {result.jobId}</p>
            <p>You can track progress in <a href="/dashboard/jobs">My Jobs</a></p>
          </div>
        )}

        <style jsx>{`
          div { margin-bottom: 20px; }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          input[type="text"],
          input[type="number"],
          select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          button {
            background: #0070f3;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
          }
          button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          .error { color: red; }
          .success {
            background: #d4edda;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from '../../components/DashboardLayout';
import { useState } from 'react';
import { firebaseAuth } from '../../lib/firebase/config';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const performAuditFn = httpsCallable(functions, 'performAudit');

export default function GmapsScraper() {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [strategy, setStrategy] = useState<'Basic' | 'Moderate' | 'Deep'>('Basic');
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
      const response = await performAuditFn({
        businessName: businessName.trim(),
        location: location.trim(),
        clientEmail: currentUser.email || '',
      });

      const data = response.data as any;
      setResult(data);
    } catch (err: any) {
      const msg = err?.message || err?.details || 'Audit failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const score = result?.score;
  const scoreColor = score >= 70 ? '#22C55E' : score >= 40 ? '#EAB308' : '#EF4444';

  return (
    <DashboardLayout>
      <div className="audit-page">
        <div className="page-header">
          <div>
            <div className="category-tag">ENTITY AUDIT · BUSINESS VERIFICATION</div>
            <h1 className="page-title">Google Maps Business Auditor</h1>
            <p className="page-subtitle">
              Audit your own business listing — verify your official name, category, address, click-to-call phone, website, and ratings.
            </p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="audit-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Happy Hunter Digital"
                  required
                />
                <span className="field-hint">Your exact business name as it appears on Google Maps.</span>
              </div>
              <div className="form-group flex-1">
                <label>Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Pretoria"
                  required
                />
                <span className="field-hint">The city or area your business operates in.</span>
              </div>
            </div>

            <div className="form-group">
              <label>Audit Depth</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
                <option value="Basic">Basic — Free · Core fields (~30s)</option>
                <option value="Moderate">Moderate — R5 · Extended fields (~2–3 min)</option>
                <option value="Deep">Deep Search — R15 · All 50+ fields (~5–10 min)</option>
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Running Audit...' : 'Start Business Audit'}
            </button>
          </form>

          {error && (
            <div className="alert-box error">
              <span>{error}</span>
            </div>
          )}
        </div>

        {result && (
          <div className="results-section">
            <div className="score-card">
              <div className="score-ring" style={{ borderColor: scoreColor }}>
                <span className="score-num" style={{ color: scoreColor }}>{score}</span>
                <span className="score-label">/ 100</span>
              </div>
              <div className="score-meta">
                <span className="score-title" style={{ color: scoreColor }}>
                  {score >= 70 ? 'HEALTHY ENTITY' : score >= 40 ? 'AT RISK' : 'CRITICAL'}
                </span>
                <span className="score-sub">Digital Survival Score</span>
              </div>
            </div>

            {result.telemetry && (
              <div className="telemetry-card">
                <div className="tele-row">
                  <span className="tele-label">Maps Status</span>
                  <span className={`tele-value status-${result.telemetry.mapsStatus?.includes('VERIFIED') ? 'ok' : result.telemetry.mapsStatus?.includes('HIJACK') ? 'warn' : 'bad'}`}>
                    {result.telemetry.mapsStatus}
                  </span>
                </div>
                {result.telemetry.mapsName && (
                  <div className="tele-row">
                    <span className="tele-label">Maps Name</span>
                    <span className="tele-value">{result.telemetry.mapsName}</span>
                  </div>
                )}
                {result.telemetry.rating != null && (
                  <div className="tele-row">
                    <span className="tele-label">Rating</span>
                    <span className="tele-value">{result.telemetry.rating} ({result.telemetry.reviewCount} reviews)</span>
                  </div>
                )}
                <div className="tele-row">
                  <span className="tele-label">Website</span>
                  <span className="tele-value">{result.telemetry.website}</span>
                </div>
                <div className="tele-row">
                  <span className="tele-label">Schema Markup</span>
                  <span className={`tele-value ${result.telemetry.schema ? 'ok' : 'bad'}`}>
                    {result.telemetry.schema ? `Detected (${result.telemetry.schemasDetected?.join(', ')})` : 'Missing'}
                  </span>
                </div>
              </div>
            )}

            {result.truths && (
              <div className="truths-card">
                <h3>3 Truths</h3>
                {result.truths.map((t: string, i: number) => (
                  <div key={i} className="truth-item">
                    <span className="truth-num">{i + 1}</span>
                    <p>{t}</p>
                  </div>
                ))}
              </div>
            )}

            {result.summary && (
              <div className="summary-card">
                <h3>AI Analysis</h3>
                <p>{result.summary}</p>
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          .audit-page {
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
          .card {
            background: #0D0D0D;
            border: 1px solid #1F1F1F;
            border-radius: 12px;
            padding: 28px;
          }
          .audit-form {
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
          .results-section {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .score-card {
            background: #0D0D0D;
            border: 1px solid #1F1F1F;
            border-radius: 12px;
            padding: 28px;
            display: flex;
            align-items: center;
            gap: 24px;
          }
          .score-ring {
            width: 90px;
            height: 90px;
            border: 4px solid;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .score-num {
            font-size: 32px;
            font-weight: 900;
            line-height: 1;
          }
          .score-label {
            font-size: 11px;
            color: #8E8E93;
          }
          .score-meta {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .score-title {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 1px;
          }
          .score-sub {
            font-size: 12px;
            color: #8E8E93;
          }
          .telemetry-card {
            background: #0D0D0D;
            border: 1px solid #1F1F1F;
            border-radius: 12px;
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .tele-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #1A1A1A;
          }
          .tele-row:last-child { border-bottom: none; }
          .tele-label {
            font-size: 12px;
            color: #8E8E93;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .tele-value {
            font-size: 13px;
            color: #FFFFFF;
            font-weight: 500;
          }
          .tele-value.ok { color: #22C55E; }
          .tele-value.warn { color: #EAB308; }
          .tele-value.bad { color: #EF4444; }
          .truths-card, .summary-card {
            background: #0D0D0D;
            border: 1px solid #1F1F1F;
            border-radius: 12px;
            padding: 24px;
          }
          .truths-card h3, .summary-card h3 {
            margin: 0 0 16px;
            font-size: 14px;
            color: #EAB308;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .truth-item {
            display: flex;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #1A1A1A;
          }
          .truth-item:last-child { border-bottom: none; }
          .truth-num {
            width: 24px;
            height: 24px;
            background: rgba(234, 179, 8, 0.15);
            color: #EAB308;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            flex-shrink: 0;
          }
          .truth-item p {
            margin: 0;
            font-size: 13px;
            color: #D1D5DB;
            line-height: 1.6;
          }
          .summary-card p {
            margin: 0;
            font-size: 14px;
            color: #D1D5DB;
            line-height: 1.7;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

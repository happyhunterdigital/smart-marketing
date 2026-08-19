import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import { firebaseAuth, firestore } from '../../lib/firebase/config';
import { collection, query as firestoreQuery, where, onSnapshot } from 'firebase/firestore';

interface Job {
  id: string;
  userId: string;
  tool: string;
  query: string;
  strategy: string;
  maxResults: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  resultUrl?: string;
  error?: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth.currentUser) return;

    const q = firestoreQuery(
      collection(firestore, 'jobs'),
      where('userId', '==', firebaseAuth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];

      jobsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setJobs(jobsData);
      setLoading(false);
    }, (err) => {
      console.error('Jobs snapshot error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout>
      <div className="jobs-page">
        <div className="page-header">
          <div>
            <div className="category-tag">WORKER QUEUE</div>
            <h1 className="page-title">My Jobs</h1>
            <p className="page-subtitle">
              Track your audit jobs — status, results, and download links.
            </p>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <p>No jobs found.</p>
              <a href="/dashboard/gmaps-scraper" className="empty-link">Create your first audit →</a>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job.id} className="job-row">
                  <div className="job-main">
                    <span className="job-query">{job.query}</span>
                    <span className="job-meta">
                      {job.strategy} · {job.maxResults.toLocaleString()} results
                    </span>
                  </div>
                  <div className="job-right">
                    <span className={`status-badge status-${job.status}`}>
                      {job.status}
                    </span>
                    <span className="job-date">
                      {new Date(job.createdAt).toLocaleDateString('en-ZA', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <div className="job-actions">
                      {job.resultUrl && (
                        <a href={job.resultUrl} target="_blank" rel="noopener noreferrer" className="action-link">
                          Download
                        </a>
                      )}
                      {job.error && (
                        <span className="error-tooltip" title={job.error}>Error</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .jobs-page {
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
          .page-title {
            font-size: 26px;
            font-weight: 800;
            color: #FFFFFF;
            margin: 0 0 6px;
          }
          .page-subtitle {
            font-size: 13.5px;
            color: #8E8E93;
            margin: 0;
          }
          .card {
            background: #0D0D0D;
            border: 1px solid #1F1F1F;
            border-radius: 12px;
            padding: 28px;
          }
          .loading-state {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #8E8E93;
            font-size: 14px;
            padding: 40px 0;
            justify-content: center;
          }
          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(234, 179, 8, 0.2);
            border-top-color: #EAB308;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .empty-state {
            text-align: center;
            padding: 40px 0;
            color: #8E8E93;
            font-size: 14px;
          }
          .empty-link {
            color: #EAB308;
            font-weight: 700;
            text-decoration: none;
            margin-top: 8px;
            display: inline-block;
          }
          .empty-link:hover { text-decoration: underline; }
          .jobs-list {
            display: flex;
            flex-direction: column;
          }
          .job-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #1F1F1F;
          }
          .job-row:last-child { border-bottom: none; }
          .job-main {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .job-query {
            color: #FFFFFF;
            font-weight: 600;
            font-size: 14px;
          }
          .job-meta {
            color: #8E8E93;
            font-size: 12px;
          }
          .job-right {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .status-badge {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 4px 10px;
            border-radius: 20px;
          }
          .status-pending {
            color: #F59E0B;
            background: rgba(245, 158, 11, 0.12);
          }
          .status-running {
            color: #3B82F6;
            background: rgba(59, 130, 246, 0.12);
          }
          .status-completed {
            color: #22C55E;
            background: rgba(34, 197, 94, 0.12);
          }
          .status-failed {
            color: #EF4444;
            background: rgba(239, 68, 68, 0.12);
          }
          .job-date {
            color: #8E8E93;
            font-size: 12px;
          }
          .job-actions {
            display: flex;
            gap: 8px;
          }
          .action-link {
            color: #EAB308;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
          }
          .action-link:hover { text-decoration: underline; }
          .error-tooltip {
            color: #EF4444;
            font-size: 12px;
            cursor: help;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

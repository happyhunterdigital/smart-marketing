import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import { firebaseAuth, firestore } from '../../lib/firebase/config';
import { collection, query as firestoreQuery, where, onSnapshot, orderBy } from 'firebase/firestore';

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
      where('userId', '==', firebaseAuth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      
      setJobs(jobsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <p>Loading jobs...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1>My Jobs</h1>
        
        {jobs.length === 0 ? (
          <p>No jobs found. <a href="/dashboard/gmaps-scraper">Create your first job</a></p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Query</th>
                <th>Tool</th>
                <th>Strategy</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.query}</td>
                  <td>{job.tool}</td>
                  <td>{job.strategy}</td>
                  <td>
                    <span className={`status-${job.status}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{new Date(job.createdAt).toLocaleString()}</td>
                  <td>
                    {job.resultUrl && (
                      <a href={job.resultUrl} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    )}
                    {job.error && (
                      <span className="error" title={job.error}>⚠️</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #f5f5f5;
        }
        .status-pending { color: orange; }
        .status-running { color: blue; }
        .status-completed { color: green; }
        .status-failed { color: red; }
        .error { color: red; }
      `}</style>
    </DashboardLayout>
  );
}

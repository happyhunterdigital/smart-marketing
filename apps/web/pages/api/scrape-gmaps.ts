// pages/api/scrape-gmaps.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '../../lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// POST /api/scrape-gmaps
// {
//   "query": "restaurants in New York",
//   "strategy": "Basic" | "Moderate" | "Deep",
//   "maxResults": 50 | 500 | 5000
// }

const STRATEGY_CONFIG = {
  Basic:   { maxResults: 50,    label: 'Basic',   free: true  },
  Moderate: { maxResults: 500,  label: 'Moderate', free: false },
  Deep:    { maxResults: 5000, label: 'Deep Search', free: false },
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, strategy = 'Basic', maxResults } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!['Basic', 'Moderate', 'Deep'].includes(strategy)) {
    return res.status(400).json({ error: 'Invalid strategy. Choose Basic, Moderate, or Deep.' });
  }

  const userId = req.headers.authorization?.split('Bearer ')[1];

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Load user document
  const userRef = doc(firestore, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userData = userDoc.data();
  const config = STRATEGY_CONFIG[strategy as keyof typeof STRATEGY_CONFIG];
  const effectiveMaxResults = config.maxResults;

  // Free tier restriction: Basic is limited to 1 free audit per account
  if (config.free) {
    const freeAuditsUsed = userData.freeAuditsUsed ?? 0;
    if (freeAuditsUsed >= 1) {
      return res.status(403).json({
        error: 'Free audit already used. Upgrade to Moderate (R5) or Deep Search (R15) for more audits.',
      });
    }
  } else {
    // Paid tier: check quota
    if ((userData.gmapsQuota ?? 0) <= 0) {
      return res.status(403).json({ error: 'Search quota exhausted. Please upgrade your plan under Billing.' });
    }
  }

  // Create audit job
  const jobId = `${userId}_${Date.now()}`;
  const timestamp = new Date().toISOString();

  await setDoc(doc(firestore, 'jobs', jobId), {
    id: jobId,
    userId: userId,
    tool: 'google-maps-scraper',
    query: query,
    strategy: strategy,
    maxResults: effectiveMaxResults,
    status: 'pending',
    createdAt: timestamp,
    resultUrl: null,
    error: null,
  });

  // Update user counters
  if (config.free) {
    await updateDoc(userRef, {
      freeAuditsUsed: (userData.freeAuditsUsed ?? 0) + 1,
    });
  } else {
    await updateDoc(userRef, {
      gmapsQuota: (userData.gmapsQuota ?? 0) - 1,
    });
  }

  res.status(200).json({
    jobId: jobId,
    message: 'Job created successfully',
  });
}

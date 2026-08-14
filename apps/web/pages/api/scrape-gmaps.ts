// pages/api/scrape-gmaps.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '../../lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// POST /api/scrape-gmaps
// {
//   "query": "restaurants in New York",
//   "strategy": "Fast" | "Detailed" | "Zoom18" | "Geolocation",
//   "maxResults": 1000
// }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, strategy = 'Fast', maxResults = 1000 } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const userId = req.headers.authorization?.split('Bearer ')[1];
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check rate limits and quota
  const quotaRef = doc(firestore, 'users', userId);
  const quotaDoc = await getDoc(quotaRef);
  
  if (!quotaDoc.exists()) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userData = quotaDoc.data();
  if (userData.gmapsQuota <= 0) {
    return res.status(403).json({ error: 'Quota exceeded. Upgrade your plan.' });
  }

  // Create scraping job
  const jobId = `${userId}_${Date.now()}`;
  const timestamp = new Date().toISOString();

  await setDoc(doc(firestore, 'jobs', jobId), {
    id: jobId,
    userId: userId,
    tool: 'google-maps-scraper',
    query: query,
    strategy: strategy,
    maxResults: maxResults,
    status: 'pending',
    createdAt: timestamp,
    resultUrl: null,
    error: null
  });

  // Decrement quota
  await updateDoc(quotaRef, {
    gmapsQuota: userData.gmapsQuota - 1
  });

  // Trigger the actual scraping asynchronously (via Firebase Cloud Function or external worker)
  // Here we'd typically publish to a task queue
  res.status(200).json({ 
    jobId: jobId,
    message: 'Job created successfully' 
  });
}

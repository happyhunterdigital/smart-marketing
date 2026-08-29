"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { firebaseAuth, firestore } from '../../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import RolePickerStep from '../../components/onboarding/RolePickerStep';
import { RoleId } from '../../components/onboarding/types';

export default function OnboardingWizard(): React.JSX.Element {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.uid);
      try {
        const snap = await getDoc(doc(firestore, 'users', user.uid));
        if (snap.exists() && snap.data()?.role) {
          router.push('/dashboard');
        }
      } catch {}
    });
    return () => unsub();
  }, [router]);

  const handleNext = async (): Promise<void> => {
    if (!selectedRole || !userId || saving) return;
    setSaving(true);
    try {
      await updateDoc(doc(firestore, 'users', userId), { role: selectedRole });
      if (selectedRole === 'organization') {
        router.push('/dashboard/billing');
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error('Failed to save role', e);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 py-10 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 900px 600px at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 62%)' }} aria-hidden="true" />
      <div className="w-full flex justify-center relative z-10">
        <RolePickerStep selectedRole={selectedRole} onSelectRole={setSelectedRole} onNext={handleNext} />
      </div>
      {saving && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">Saving...</span>
        </div>
      )}
    </div>
  );
}

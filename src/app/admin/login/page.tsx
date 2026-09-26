'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { firebaseAuth, googleProvider, allowedAdminEmail } from '@/lib/firebase-client';
import { api } from '@/lib/client-api';

export default function AdminLoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user && allowedAdminEmail(user.email)) window.location.replace('/dashboard');
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      if (!allowedAdminEmail(result.user.email)) {
        await signOut(firebaseAuth);
        throw new Error('Only authorised Google admin accounts can sign in.');
      }
      await api('/auth/firebase', { method: 'POST', body: JSON.stringify({ idToken: await result.user.getIdToken() }) });
      window.location.replace('/dashboard');
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Google sign-in failed.');
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" aria-label="EASYTECH LONDON LTD home" style={{ textDecoration: 'none' }}>
          <Image src="/Easy Tech solution logo.png" alt="EASYTECH LONDON LTD" width={56} height={56} style={{ objectFit: 'contain' }} priority />
        </Link>
        <p className="eyebrow">EASYTECH LONDON LTD · ADMIN</p>
        <h1>Admin sign in</h1>
        <p className="muted">Sign in with your authorised administrator account to manage the ledger.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary full" onClick={login} disabled={busy}>{busy ? 'Signing in...' : 'Continue with Google'}</button>
        <small>Admin access only. Public registration is not available.</small>
        <Link href="/" style={{ display: 'block', marginTop: 18, color: 'var(--muted)', textAlign: 'center', fontSize: 12, textDecoration: 'none' }}>← Back to home</Link>
      </section>
    </main>
  );
}
import { firebaseAuth } from './firebase-client';

export async function api<T>(path: string, init: RequestInit = {}) {
  const token = await firebaseAuth.currentUser?.getIdToken();
  const response = await fetch(`/api${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data as T;
}

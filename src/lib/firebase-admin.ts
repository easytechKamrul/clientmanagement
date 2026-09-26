import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function adminAuth() {
  if (!getApps().length) {
    initializeApp({ credential: cert({
      projectId: required('FIREBASE_PROJECT_ID'),
      clientEmail: required('FIREBASE_CLIENT_EMAIL'),
      privateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n')
    }) });
  }
  return getAuth();
}

export function allowedAdminEmail(email?: string | null) {
  return !!email && (process.env.ADMIN_EMAILS || '').split(',').map((item) => item.trim().toLowerCase()).includes(email.trim().toLowerCase());
}

export async function verifyIdToken(token: string) {
  return adminAuth().verifyIdToken(token);
}

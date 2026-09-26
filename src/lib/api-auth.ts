import { NextRequest } from 'next/server';
import { allowedAdminEmail, verifyIdToken } from './firebase-admin';
import { verifyToken } from './jwt';

export async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('UNAUTHORIZED');
  try {
    const decoded = await verifyIdToken(token);
    const email = decoded.email?.trim().toLowerCase();
    if (!decoded.email_verified || !allowedAdminEmail(email)) throw new Error('FORBIDDEN');
    return { userId: email };
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') throw error;
    try { return verifyToken(token); } catch { throw new Error('UNAUTHORIZED'); }
  }
}

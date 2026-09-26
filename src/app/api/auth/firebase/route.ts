import { NextRequest, NextResponse } from 'next/server';
import { allowedAdminEmail, verifyIdToken } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) return NextResponse.json({ message: 'Firebase ID token is required' }, { status: 400 });
    const decoded = await verifyIdToken(idToken);
    const email = decoded.email?.trim().toLowerCase();
    if (!decoded.email_verified || !allowedAdminEmail(email)) return NextResponse.json({ message: 'Access denied. This email is not an authorised admin.' }, { status: 403 });
    return NextResponse.json({ userId: email });
  } catch { return NextResponse.json({ message: 'Invalid Firebase ID token' }, { status: 401 }); }
}

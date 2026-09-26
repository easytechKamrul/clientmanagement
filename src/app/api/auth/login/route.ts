import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import Admin from '@/models/Admin';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json();
    if (!userId || !password) return NextResponse.json({ message: 'User ID and password are required' }, { status: 400 });
    await connectDB();
    const admin = await Admin.findOne({ userId: String(userId).trim() });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return NextResponse.json({ message: 'Wrong user ID or password' }, { status: 401 });
    return NextResponse.json({ token: signToken({ id: admin.id, userId: admin.userId }), userId: admin.userId });
  } catch { return NextResponse.json({ message: 'Unable to sign in' }, { status: 500 }); }
}

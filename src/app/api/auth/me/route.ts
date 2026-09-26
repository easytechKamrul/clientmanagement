import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try { return NextResponse.json(await requireAdmin(request)); }
  catch (error) { return NextResponse.json({ message: error instanceof Error && error.message === 'FORBIDDEN' ? 'Access denied' : 'Authentication required' }, { status: error instanceof Error && error.message === 'FORBIDDEN' ? 403 : 401 }); }
}

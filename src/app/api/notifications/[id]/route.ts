import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import Notification from '@/models/Notification';

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return NextResponse.json(
    { message: message === 'FORBIDDEN' ? 'Access denied' : message === 'UNAUTHORIZED' ? 'Authentication required' : 'Request failed' },
    { status: message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500 }
  );
}

// GET /api/notifications/[id]  -> একটা নোটিফিকেশনের বিস্তারিত (Details)
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    await connectDB();
    const { id } = await context.params;
    const notification = await Notification.findById(id).lean();
    if (!notification) return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    return NextResponse.json(notification);
  } catch (error) {
    return failure(error);
  }
}

// DELETE /api/notifications/[id]  -> একটা নোটিফিকেশন মুছে ফেলা
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    await connectDB();
    const { id } = await context.params;
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted', id });
  } catch (error) {
    return failure(error);
  }
}
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

// GET /api/notifications  -> সব নোটিফিকেশনের লিস্ট (নতুনগুলো আগে)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json(notifications);
  } catch (error) {
    return failure(error);
  }
}

// DELETE /api/notifications  -> সব নোটিফিকেশন মুছে ফেলা (Delete all)
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    const result = await Notification.deleteMany({});
    return NextResponse.json({ message: 'All notifications deleted', deletedCount: result.deletedCount });
  } catch (error) {
    return failure(error);
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import Entry from '@/models/Entry';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { amount, date } = await request.json();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json({ message: 'Enter a refund amount greater than zero' }, { status: 400 });
    }

    await connectDB();
    const { id } = await context.params;
    const entry = await Entry.findById(id);
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

    const refundDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date().toISOString().slice(0, 10);
    entry.refunds.push({ date: refundDate, amount: value });
    entry.updateHistory = entry.updateHistory || [];
    entry.updateHistory.push({ date: refundDate, description: `Refund recorded: £${value}` });
    await entry.save();
    return NextResponse.json(entry.toObject());
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500;
    const response = status === 403 ? 'Access denied' : status === 401 ? 'Authentication required' : 'Request failed';
    return NextResponse.json({ message: response }, { status });
  }
}
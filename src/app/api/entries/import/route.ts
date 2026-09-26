import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import Entry, { ENTRY_STATUSES, type EntryStatus } from '@/models/Entry';

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return NextResponse.json({ message: message === 'FORBIDDEN' ? 'Access denied' : message === 'UNAUTHORIZED' ? 'Authentication required' : 'Import failed' }, { status: message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500 });
}

function normalizeStatus(value: unknown): EntryStatus {
  const status = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  const aliases: Record<string, EntryStatus> = { complete: 'Complete', completed: 'Complete', progress: 'Progress', 'due later': 'Due Later', pending: 'Pending', 'handover pending': 'Pending', cancelled: 'Cancelled', canceled: 'Cancelled' };
  return aliases[status] || (ENTRY_STATUSES.includes(value as EntryStatus) ? value as EntryStatus : 'Progress');
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body: unknown = await request.json();
    if (!Array.isArray(body) || !body.length) return NextResponse.json({ message: 'JSON must contain a non-empty array of entries' }, { status: 400 });

    const fallbackDate = new Date().toISOString().slice(0, 10);
    const records = body.map((value) => {
      const item = value && typeof value === 'object' ? value as Record<string, unknown> : {};
      const date = typeof item.date === 'string' && item.date.trim() ? item.date : fallbackDate;
      const payments = Array.isArray(item.payments) ? item.payments.map((payment) => {
        const entry = payment && typeof payment === 'object' ? payment as Record<string, unknown> : {};
        return { date: typeof entry.date === 'string' && entry.date.trim() ? entry.date : date, amount: Math.max(0, Number(entry.amount) || 0) };
      }) : [];
      return { date, client: String(item.client || '').trim(), service: String(item.service || 'Not set').trim(), status: normalizeStatus(item.status), deal: Math.max(0, Number(item.deal) || 0), advance: Math.max(0, Number(item.advance) || 0), payments, commission: Math.max(0, Number(item.commission) || 0), reference: String(item.reference || ''), email: String(item.email || ''), phone: String(item.phone || ''), notes: String(item.notes || ''), startedDate: typeof item.startedDate === 'string' && item.startedDate.trim() ? item.startedDate : undefined };
    });
    const invalid = records.findIndex((entry) => !entry.client);
    if (invalid >= 0) return NextResponse.json({ message: `Client name is required at item ${invalid + 1}` }, { status: 400 });

    await connectDB();
    const imported = await Entry.insertMany(records);
    return NextResponse.json({ imported: imported.length }, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}

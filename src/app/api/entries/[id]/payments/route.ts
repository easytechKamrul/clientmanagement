import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import Entry from '@/models/Entry';
import { sendWhatsAppNotification, sendWhatsAppStatusNotification } from '@/lib/whatsapp';
import { isPaidInFull } from '@/lib/money';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request); const { date, amount } = await request.json(); const value = Number(amount);
    if (!value || value <= 0) return NextResponse.json({ message: 'Enter a payment amount greater than zero' }, { status: 400 });
    await connectDB(); const { id } = await context.params; const entry = await Entry.findById(id);
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    const oldStatus = entry.status;
    entry.payments.push({ date: date || new Date().toISOString().slice(0, 10), amount: value });
    if (isPaidInFull(entry) && entry.status !== 'Complete') {
      entry.status = 'Complete';
      entry.updateHistory = entry.updateHistory || [];
      entry.updateHistory.push({ date: new Date().toISOString().slice(0, 10), description: `Status: ${oldStatus} -> Complete` });
    }
    await entry.save(); await sendWhatsAppNotification(entry, 'payment_received', value);
    if (oldStatus !== entry.status) await sendWhatsAppStatusNotification(entry);
    return NextResponse.json(entry.toObject());
  } catch (error) { const message = error instanceof Error ? error.message : ''; return NextResponse.json({ message: message === 'FORBIDDEN' ? 'Access denied' : message === 'UNAUTHORIZED' ? 'Authentication required' : 'Request failed' }, { status: message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500 }); }
}

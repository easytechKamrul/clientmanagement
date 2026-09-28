import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import Entry, { type IPayment } from '@/models/Entry';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request); const { date, amount } = await request.json(); const value = Number(amount);
    if (!value || value <= 0) return NextResponse.json({ message: 'Enter a payment amount greater than zero' }, { status: 400 });
    await connectDB(); const { id } = await context.params; const entry = await Entry.findById(id);
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    const previousDue = Math.max(0, entry.deal - entry.advance - entry.payments.reduce((sum: number, payment: IPayment) => sum + payment.amount, 0));
    entry.payments.push({ date: date || new Date().toISOString().slice(0, 10), amount: value }); await entry.save(); await sendWhatsAppNotification(entry, 'payment_received', value);
    const due = Math.max(0, entry.deal - entry.advance - entry.payments.reduce((sum: number, payment: IPayment) => sum + payment.amount, 0));
    if (entry.status === 'Complete' && previousDue > 0 && due === 0) await sendWhatsAppNotification(entry, 'completed');
    return NextResponse.json(entry.toObject());
  } catch (error) { const message = error instanceof Error ? error.message : ''; return NextResponse.json({ message: message === 'FORBIDDEN' ? 'Access denied' : message === 'UNAUTHORIZED' ? 'Authentication required' : 'Request failed' }, { status: message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500 }); }
}

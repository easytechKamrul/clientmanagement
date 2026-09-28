import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import Entry, { ENTRY_STATUSES } from '@/models/Entry';
import { sendWhatsAppStatusNotification } from '@/lib/whatsapp';

function failure(error: unknown) { const message = error instanceof Error ? error.message : ''; return NextResponse.json({ message: message === 'FORBIDDEN' ? 'Access denied' : message === 'UNAUTHORIZED' ? 'Authentication required' : 'Request failed' }, { status: message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500 }); }

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request); await connectDB(); const { id } = await context.params; const entry = await Entry.findById(id);
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    const body = await request.json();
    if (body.status !== undefined && !ENTRY_STATUSES.includes(body.status)) return NextResponse.json({ message: 'Invalid entry status' }, { status: 400 });
    const oldStatus = entry.status;
    if (body.date !== undefined) entry.date = body.date; if (body.client !== undefined) entry.client = body.client.trim(); if (body.service !== undefined) entry.service = body.service.trim();
    if (body.status !== undefined) { const wasPending = entry.status === 'Pending'; entry.status = body.status; if (wasPending && entry.status === 'Progress' && !entry.startedDate) entry.startedDate = new Date().toISOString().slice(0, 10); }
    if (body.deal !== undefined) entry.deal = Number(body.deal) || 0; if (body.advance !== undefined) entry.advance = Number(body.advance) || 0; if (body.payments !== undefined) entry.payments = body.payments;
    if (body.commission !== undefined) entry.commission = Number(body.commission) || 0; if (body.reference !== undefined) entry.reference = body.reference; if (body.email !== undefined) entry.email = body.email; if (body.phone !== undefined) entry.phone = body.phone; if (body.notes !== undefined) entry.notes = body.notes;
    await entry.save();
    if (body.status !== undefined) {
      await Entry.updateOne({ _id: id }, { $set: { status: body.status } });
      entry.status = body.status;
    }
    if (oldStatus !== entry.status) await sendWhatsAppStatusNotification(entry);
    return NextResponse.json(entry.toObject());
  } catch (error) { return failure(error); }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request); await connectDB(); const { id } = await context.params; const entry = await Entry.findByIdAndDelete(id); if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 }); return NextResponse.json({ message: 'Deleted', id }); }
  catch (error) { return failure(error); }
}

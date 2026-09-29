import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import Entry, { ENTRY_STATUSES } from '@/models/Entry';
import { sendWhatsAppStatusNotification } from '@/lib/whatsapp';
import { isPaidInFull } from '@/lib/money';

function failure(error: unknown) { const message = error instanceof Error ? error.message : ''; return NextResponse.json({ message: message === 'FORBIDDEN' ? 'Access denied' : message === 'UNAUTHORIZED' ? 'Authentication required' : 'Request failed' }, { status: message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500 }); }

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request); await connectDB(); const { id } = await context.params; const entry = await Entry.findById(id);
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    const body = await request.json();
    if (body.status !== undefined && !ENTRY_STATUSES.includes(body.status)) return NextResponse.json({ message: 'Invalid entry status' }, { status: 400 });
    const oldStatus = entry.status;
    const changes: string[] = [];
    if (body.status !== undefined && body.status !== entry.status) changes.push(`Status: ${entry.status} -> ${body.status}`);
    if (body.client !== undefined && body.client.trim() !== entry.client) changes.push('Client updated');
    if (body.service !== undefined && body.service.trim() !== entry.service) changes.push('Service updated');
    if (body.deal !== undefined && (Number(body.deal) || 0) !== entry.deal) changes.push('Deal updated');
    if (body.advance !== undefined && (Number(body.advance) || 0) !== entry.advance) changes.push('Advance updated');
    if (body.commission !== undefined && (Number(body.commission) || 0) !== entry.commission) changes.push('Commission updated');
    if (body.reference !== undefined && body.reference !== entry.reference) changes.push('Reference updated');
    if (body.email !== undefined && body.email !== entry.email) changes.push('Email updated');
    if (body.phone !== undefined && body.phone !== entry.phone) changes.push('Phone updated');
    if (body.notes !== undefined && body.notes !== entry.notes) changes.push('Notes updated');
    if (body.payments !== undefined && JSON.stringify(body.payments) !== JSON.stringify(entry.payments)) changes.push('Payments updated');
    if (body.client !== undefined) entry.client = body.client.trim(); if (body.service !== undefined) entry.service = body.service.trim();
    if (body.status !== undefined) { const wasPending = entry.status === 'Pending'; entry.status = body.status; if (wasPending && entry.status === 'Progress' && !entry.startedDate) entry.startedDate = new Date().toISOString().slice(0, 10); }
    if (body.deal !== undefined) entry.deal = Number(body.deal) || 0; if (body.advance !== undefined) entry.advance = Number(body.advance) || 0; if (body.payments !== undefined) entry.payments = body.payments;
    if (body.commission !== undefined) entry.commission = Number(body.commission) || 0; if (body.reference !== undefined) entry.reference = body.reference; if (body.email !== undefined) entry.email = body.email; if (body.phone !== undefined) entry.phone = body.phone; if (body.notes !== undefined) entry.notes = body.notes;
    const statusWasExplicitlyChanged = body.status !== undefined && body.status !== oldStatus;
    if (isPaidInFull(entry) && !statusWasExplicitlyChanged && entry.status !== 'Complete') {
      changes.push(`Status: ${entry.status} -> Complete`);
      entry.status = 'Complete';
    }
    if (changes.length === 0) changes.push('Entry edited');
    entry.updateHistory = entry.updateHistory || [];
    entry.updateHistory.push({ date: new Date().toISOString().slice(0, 10), description: changes.join(', ') });
    await entry.save();
    if (oldStatus !== entry.status) await sendWhatsAppStatusNotification(entry);
    return NextResponse.json(entry.toObject());
  } catch (error) { return failure(error); }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request); await connectDB(); const { id } = await context.params; const entry = await Entry.findByIdAndDelete(id); if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 }); return NextResponse.json({ message: 'Deleted', id }); }
  catch (error) { return failure(error); }
}

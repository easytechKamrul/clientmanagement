import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import Entry, { ENTRY_STATUSES, type EntryStatus } from '@/models/Entry';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

function failure(error: unknown) { const message = error instanceof Error ? error.message : ''; return NextResponse.json({ message: message === 'FORBIDDEN' ? 'Access denied' : message === 'UNAUTHORIZED' ? 'Authentication required' : 'Request failed' }, { status: message === 'FORBIDDEN' ? 403 : message === 'UNAUTHORIZED' ? 401 : 500 }); }

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); await connectDB(); return NextResponse.json(await Entry.find().sort({ date: -1, createdAt: -1 }).lean()); }
  catch (error) { return failure(error); }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request); const body = await request.json();
    if (!body.client?.trim()) return NextResponse.json({ message: 'Client name is required' }, { status: 400 });
    if (body.status && !ENTRY_STATUSES.includes(body.status)) return NextResponse.json({ message: 'Invalid entry status' }, { status: 400 });
    await connectDB();
    const entry = await Entry.create({ date: body.date, client: body.client.trim(), service: (body.service || 'Not set').trim(), status: body.status || 'Progress', deal: Number(body.deal) || 0, advance: Number(body.advance) || 0, payments: Array.isArray(body.payments) ? body.payments : [], commission: Number(body.commission) || 0, reference: body.reference || '', email: body.email || '', phone: body.phone || '', notes: body.notes || '', startedDate: body.status === 'Progress' ? new Date().toISOString().slice(0, 10) : undefined });
    await sendWhatsAppNotification(entry, 'created');
    return NextResponse.json(entry.toObject(), { status: 201 });
  } catch (error) { return failure(error); }
}

import { IEntry } from '../models/Entry';
import { connectDB } from './db';
import Notification from '../models/Notification';

// নতুন ইভেন্ট টাইপগুলো সহ
type EventName = 
  | 'document_pending' 
  | 'work_started' 
  | 'payment_received' 
  | 'work_finished' 
  | 'completed'
  | 'refund_received';

function normalizePhone(raw: string): string {
  const d = (raw || '').replace(/[^0-9]/g, '');
  if (!d) return '';
  if (d.startsWith('00')) return d.slice(2);

  if (d.startsWith('880') && d.length === 13) return d;
  if (d.startsWith('01') && d.length === 11) return `88${d}`;
  if (d.length === 10 && d.startsWith('1')) return `880${d}`;

  if (d.startsWith('44') && d.length === 12) return d;
  if (d.startsWith('0') && d.length === 11) return `44${d.slice(1)}`;

  return d;
}

const text = (value: unknown) => {
  const s = String(value ?? '').replace(/\s+/g, ' ').trim();
  return s || '-';
};

async function logNotification(data: {
  entryId?: string;
  client: string;
  phone: string;
  event: string;
  templateName: string;
  status: 'sent' | 'failed';
  message?: string;
  amount?: number;
}) {
  try {
    await connectDB();
    await Notification.create(data);
  } catch (error) {
    console.error('[whatsapp] failed to write notification log', error);
  }
}

export async function sendWhatsAppNotification(entry: IEntry, event: EventName, paymentAmount?: number) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const rawTargetPhone = entry.phone;
  const to = normalizePhone(rawTargetPhone || '');

  // এনভায়রনমেন্ট ভেরিয়েবল থেকে টেমপ্লেট নেমগুলো নেওয়া
  const docTemplate = process.env.WHATSAPP_TEMPLATE_DOC;
  const startedTemplate = process.env.WHATSAPP_TEMPLATE_STARTED;
  const paymentTemplate = process.env.WHATSAPP_TEMPLATE_PAYMENT;
  const finishedTemplate = process.env.WHATSAPP_TEMPLATE_FINISHED;
  const completedTemplate = process.env.WHATSAPP_TEMPLATE_COMPLETED;
  const refundTemplate = process.env.WHATSAPP_TEMPLATE_REFUND || 'refund_receipt';

  const totalPaid = entry.advance + entry.payments.reduce((sum, p) => sum + p.amount, 0);
  const due = Math.max(0, entry.deal - totalPaid);

  let templateName: string | undefined;
  let params: unknown[] = [];

  switch (event) {
    case 'document_pending':
      templateName = docTemplate;
      params = [entry.client];
      break;

    case 'work_started':
      templateName = startedTemplate;
      params = [entry.client, entry.deal, entry.advance, due, entry.service];
      break;

    case 'payment_received':
      templateName = paymentTemplate;
      params = [entry.client, paymentAmount ?? 0, due, entry.service];
      break;

    case 'work_finished':
      templateName = finishedTemplate;
      params = [entry.client, entry.deal, due, entry.service];
      break;

    case 'completed':
      templateName = completedTemplate;
      params = [entry.client, entry.service];
      break;

    case 'refund_received':
      templateName = refundTemplate;
      params = [entry.client, paymentAmount ?? 0, entry.service, entry.deal, totalPaid];
      break;

    default:
      console.warn('[whatsapp] unknown event type');
      return;
  }

  const entryId = (entry as unknown as { _id?: { toString(): string } })._id?.toString();

  if (!token || !phoneNumberId || !templateName || !to) {
    const reason = !to ? 'invalid or missing phone number' : !templateName ? 'template name not set in env' : 'missing WhatsApp env variables';
    console.warn(`[whatsapp] skipped (${event}): ${reason}`);
    await logNotification({
      entryId, client: entry.client, phone: rawTargetPhone || '', event, templateName: templateName || '(unset)',
      status: 'failed', message: `Skipped: ${reason}`, amount: paymentAmount,
    });
    return;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en' },
      components: [
        { type: 'body', parameters: params.map((value) => ({ type: 'text', text: text(value) })) },
      ],
    },
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0'}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[whatsapp] ${event} failed: ${errorText}`);
      await logNotification({
        entryId, client: entry.client, phone: to, event, templateName,
        status: 'failed', message: errorText.slice(0, 500), amount: paymentAmount,
      });
    } else {
      console.info(`[whatsapp] ${event} sent successfully to ${to}`);
      await logNotification({
        entryId, client: entry.client, phone: to, event, templateName,
        status: 'sent', amount: paymentAmount,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[whatsapp] request failed', error);
    await logNotification({
      entryId, client: entry.client, phone: to, event, templateName,
      status: 'failed', message, amount: paymentAmount,
    });
  }
}

export async function sendWhatsAppStatusNotification(entry: IEntry) {
  let clientEvent: EventName;
  
  switch (entry.status) {
    case 'Pending':
      clientEvent = 'document_pending';
      break;
    case 'Progress':
      clientEvent = 'work_started';
      break;
    case 'Due Later':
      clientEvent = 'work_finished';
      break;
    case 'Complete': {
      const totalPaid = entry.advance + entry.payments.reduce((sum, payment) => sum + payment.amount, 0);
      clientEvent = entry.deal > totalPaid ? 'work_finished' : 'completed';
      break;
    }
    default:
      console.warn(`[whatsapp] no notification mapped for status: ${entry.status}`);
      return;
  }

  // ১. প্রথমে ক্লায়েন্টকে নোটিফিকেশন পাঠানো
  await sendWhatsAppNotification(entry, clientEvent);

}

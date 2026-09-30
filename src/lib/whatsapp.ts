import type { IEntry } from '../models/Entry';

// নতুন ৫টি ইভেন্ট বা স্ট্যাটাস অনুযায়ী সাজানো
type EventName = 'document_pending' | 'work_started' | 'payment_received' | 'work_finished' | 'completed';

function normalizePhone(raw: string): string {
  const d = (raw || '').replace(/[^0-9]/g, '');
  if (!d) return '';
  if (d.startsWith('00')) return d.slice(2);
  if (d.startsWith('44') && d.length === 12) return d;
  if (d.startsWith('880') && d.length === 13) return d;
  if (d.startsWith('01') && d.length === 11) return `88${d}`;
  if (d.startsWith('0')) return `44${d.slice(1)}`;
  if (d.length === 10 && d.startsWith('7')) return `44${d}`;
  if (d.length === 10 && d.startsWith('1')) return `880${d}`;
  return d;
}

const text = (value: unknown) => {
  const s = String(value ?? '').replace(/\s+/g, ' ').trim();
  return s || '-';
};

export async function sendWhatsAppNotification(entry: IEntry, event: EventName, paymentAmount?: number) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = normalizePhone(entry.phone || '');

  // পরিবেশ ভেরিয়েবল থেকে ৫টি টেমপ্লেট নেম নেওয়া
  const docTemplate = process.env.WHATSAPP_TEMPLATE_DOC;                 // 1. Document checklist
  const startedTemplate = process.env.WHATSAPP_TEMPLATE_STARTED;       // 2. Work started
  const paymentTemplate = process.env.WHATSAPP_TEMPLATE_PAYMENT;     // 3. Payment received
  const finishedTemplate = process.env.WHATSAPP_TEMPLATE_FINISHED;   // 4. Work finished/waiting
  const completedTemplate = process.env.WHATSAPP_TEMPLATE_COMPLETED; // 5. Project completed

  const totalPaid = entry.advance + entry.payments.reduce((sum, p) => sum + p.amount, 0);
  const due = Math.max(0, entry.deal - totalPaid);

  let templateName: string | undefined;
  let params: unknown[] = [];

  // ইভেন্ট অনুযায়ী টেমপ্লেট এবং প্যারামিটার সেটআপ (মেটার টেমপ্লেটের ভেরিয়েবল সিরিয়াল অনুযায়ী)
  switch (event) {
    case 'document_pending':
      templateName = docTemplate;
      // {{1}} নাম
      params = [entry.client];
      break;

    case 'work_started':
      templateName = startedTemplate;
      // {{1}} নাম, {{2}} মোট ডিল, {{3}} অগ্রিম, {{4}} বাকি, {{5}} সার্ভিসের নাম
      params = [entry.client, entry.deal, entry.advance, due, entry.service];
      break;

    case 'payment_received':
      templateName = paymentTemplate;
      // {{1}} নাম, {{2}} পেমেন্ট পরিমাণ, {{3}} বাকি, {{4}} সার্ভিসের নাম
      params = [entry.client, paymentAmount ?? 0, due, entry.service];
      break;

    case 'work_finished':
      templateName = finishedTemplate;
      // {{1}} নাম, {{2}} মোট ডিল, {{3}} ফাইনাল বাকি, {{4}} সার্ভিসের নাম
      params = [entry.client, entry.deal, due, entry.service];
      break;

    case 'completed':
      templateName = completedTemplate;
      // {{1}} নাম, {{2}} সার্ভিসের নাম
      params = [entry.client, entry.service];
      break;

    default:
      console.warn('[whatsapp] unknown event type');
      return;
  }

  if (!token || !phoneNumberId || !templateName || !to) {
    console.warn('[whatsapp] skipped: missing env or phone number or template');
    return;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' },
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
    if (!response.ok) console.error(`[whatsapp] ${event} failed: ${await response.text()}`);
    else console.info(`[whatsapp] ${event} sent successfully to ${to}`);
  } catch (error) {
    console.error('[whatsapp] request failed', error);
  }
}

export async function sendWhatsAppStatusNotification(entry: IEntry) {
  let event: EventName;
  switch (entry.status) {
    case 'Pending':
      event = 'document_pending';
      break;
    case 'Progress':
      event = 'work_started';
      break;
    case 'Complete': {
      const totalPaid = entry.advance + entry.payments.reduce((sum, payment) => sum + payment.amount, 0);
      event = entry.deal > totalPaid ? 'work_finished' : 'completed';
      break;
    }
    default:
      return;
  }
  await sendWhatsAppNotification(entry, event);
}
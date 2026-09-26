import type { IEntry } from '../models/Entry';

type EventName = 'created' | 'updated' | 'payment_received';

export async function sendWhatsAppNotification(entry: IEntry, event: EventName, paymentAmount?: number) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const to = (entry.phone || '').replace(/[^0-9]/g, '');
  if (!token || !phoneNumberId || !templateName || !to) return;

  const received = entry.advance + entry.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const payload = { messaging_product: 'whatsapp', to, type: 'template', template: {
    name: templateName,
    language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' },
    components: [{ type: 'body', parameters: [entry.client, entry.status, entry.service, entry.deal, Math.max(0, entry.deal - received)].map((value) => ({ type: 'text', text: String(value) })) }]
  }};
  try {
    const response = await fetch(`https://graph.facebook.com/${process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0'}/${phoneNumberId}/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!response.ok) console.error(`[whatsapp] ${event} failed: ${await response.text()}`);
    else if (paymentAmount) console.info(`[whatsapp] payment notification sent: ${paymentAmount}`);
  } catch (error) { console.error('[whatsapp] request failed', error); }
}

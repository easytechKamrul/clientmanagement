import type { Entry } from '@/types';
export const n = (value: unknown) => Number(value) || 0;
export const received = (entry: Pick<Entry, 'advance' | 'payments'>) => n(entry.advance) + (entry.payments || []).reduce((sum, payment) => sum + n(payment.amount), 0);
export const remaining = (entry: Pick<Entry, 'deal' | 'advance' | 'payments'>) => Math.max(0, n(entry.deal) - received(entry));
export const money = (value: unknown) => `£${n(value).toLocaleString('en-GB')}`;
export const monthKey = (date: string) => (date || '').slice(0, 7);
export const monthName = (key: string) => new Date(`${key}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
export const prettyDate = (date?: string) => date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const today = () => new Date().toISOString().slice(0, 10);

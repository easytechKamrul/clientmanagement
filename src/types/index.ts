export type EntryStatus = 'Complete' | 'Progress' | 'Due Later' | 'Pending' | 'Cancelled';
export interface Payment { date: string; amount: number }
export interface Entry { _id: string; date: string; client: string; service: string; status: EntryStatus; deal: number; advance: number; payments: Payment[]; commission: number; reference?: string; email?: string; phone?: string; notes?: string; startedDate?: string; createdAt?: string; updatedAt?: string }
export type EntryInput = Omit<Entry, '_id' | 'createdAt' | 'updatedAt'>;
export const STATUSES: EntryStatus[] = ['Complete', 'Progress', 'Due Later', 'Pending', 'Cancelled'];

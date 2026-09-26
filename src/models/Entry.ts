import { Document, model, models, Schema } from 'mongoose';

export type EntryStatus = 'Complete' | 'Progress' | 'Due Later' | 'Pending' | 'Cancelled';
export const ENTRY_STATUSES: EntryStatus[] = ['Complete', 'Progress', 'Due Later', 'Pending', 'Cancelled'];
export interface IPayment { date: string; amount: number }
export interface IEntry extends Document { date: string; client: string; service: string; status: EntryStatus; deal: number; advance: number; payments: IPayment[]; commission: number; reference?: string; email?: string; phone?: string; notes?: string; startedDate?: string; createdAt: Date; updatedAt: Date }

const paymentSchema = new Schema<IPayment>({ date: { type: String, required: true }, amount: { type: Number, required: true, min: 0 } }, { _id: false });
const entrySchema = new Schema<IEntry>({
  date: { type: String, required: true }, client: { type: String, required: true, trim: true }, service: { type: String, required: true, trim: true },
  status: { type: String, enum: ENTRY_STATUSES, default: 'Progress' }, deal: { type: Number, min: 0, default: 0 }, advance: { type: Number, min: 0, default: 0 },
  payments: { type: [paymentSchema], default: [] }, commission: { type: Number, min: 0, default: 0 }, reference: { type: String, default: '', trim: true }, email: { type: String, default: '', trim: true }, phone: { type: String, default: '', trim: true }, notes: { type: String, default: '', trim: true }, startedDate: String
}, { timestamps: true });

export function applyAutoStatus(entry: Pick<IEntry, 'deal' | 'advance' | 'payments' | 'status'>) {
  if (entry.status === 'Cancelled' || entry.status === 'Pending') return entry.status;
  const received = entry.advance + entry.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = Math.max(0, entry.deal - received);
  if (entry.deal > 0 && remaining === 0) return 'Complete';
  if (entry.status === 'Complete' && remaining > 0) return 'Due Later';
  return entry.status;
}
entrySchema.pre('save', function () { this.status = applyAutoStatus(this) as EntryStatus; });
export default models.Entry || model<IEntry>('Entry', entrySchema);

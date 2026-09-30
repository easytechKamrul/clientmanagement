import { Schema, model, models, Document, Types } from 'mongoose';

export interface INotification extends Document {
  entryId?: Types.ObjectId;
  client: string;
  phone: string;
  event: string;           // e.g. 'work_started', 'payment_received'
  templateName: string;
  status: 'sent' | 'failed';
  message?: string;        // সফল হলে short summary, ব্যর্থ হলে error detail
  amount?: number;         // payment_received হলে কত টাকা পাঠানো হয়েছিল
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  entryId: { type: Schema.Types.ObjectId, ref: 'Entry' },
  client: { type: String, required: true },
  phone: { type: String, required: true },
  event: { type: String, required: true },
  templateName: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  message: { type: String },
  amount: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

// ৩০ দিন (২৫৯২০০০ সেকেন্ড) পার হলে MongoDB নিজেই document মুছে দেবে — cron লাগবে না
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default models.Notification || model<INotification>('Notification', NotificationSchema);
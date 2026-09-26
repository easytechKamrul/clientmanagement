import { Document, model, models, Schema } from 'mongoose';

export interface IAdmin extends Document { userId: string; passwordHash: string }
const adminSchema = new Schema<IAdmin>({ userId: { type: String, required: true, unique: true, trim: true }, passwordHash: { type: String, required: true } }, { timestamps: true });
export default models.Admin || model<IAdmin>('Admin', adminSchema);

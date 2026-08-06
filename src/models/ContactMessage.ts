import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  replyNotes?: string;
  repliedBy?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true, default: 'General Support Inquiry' },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['NEW', 'READ', 'REPLIED'], default: 'NEW' },
    replyNotes: { type: String, trim: true },
    repliedBy: { type: String, trim: true },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

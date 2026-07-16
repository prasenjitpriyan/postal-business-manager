import mongoose, { Schema, Document, Model } from 'mongoose';

export enum OfficialStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface IOfficial extends Document {
  name: string;
  designation: string;
  office: string; // Office Name
  phone: string;
  email?: string;
  status: OfficialStatus;
  joiningDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OfficialSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    office: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    status: { type: String, enum: Object.values(OfficialStatus), default: OfficialStatus.ACTIVE },
    joiningDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Official: Model<IOfficial> = mongoose.models.Official || mongoose.model<IOfficial>('Official', OfficialSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffice extends Document {
  officeName: string;
  officeCode: string;
  district: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfficeSchema: Schema = new Schema(
  {
    officeName: { type: String, required: true },
    officeCode: { type: String, required: true, unique: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
  },
  { timestamps: true }
);

export const Office: Model<IOffice> = mongoose.models.Office || mongoose.model<IOffice>('Office', OfficeSchema);

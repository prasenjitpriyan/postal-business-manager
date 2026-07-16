import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusinessContribution extends Document {
  officialId: mongoose.Types.ObjectId;
  contributionDate: Date;
  contributeOffice: string;
  accountType: string;
  accountsOpened: number;
  remarks?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessContributionSchema: Schema = new Schema(
  {
    officialId: { type: Schema.Types.ObjectId, ref: 'Official', required: true },
    contributionDate: { type: Date, required: true },
    contributeOffice: { type: String, required: true },
    accountType: { type: String, required: true },
    accountsOpened: { type: Number, required: true },
    remarks: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const BusinessContribution: Model<IBusinessContribution> = 
  mongoose.models.BusinessContribution || mongoose.model<IBusinessContribution>('BusinessContribution', BusinessContributionSchema);

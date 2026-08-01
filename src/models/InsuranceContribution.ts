import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInsuranceContribution extends Document {
  officialId: mongoose.Types.ObjectId;
  contributionDate: Date;
  officeOfIndexing: string;
  insuranceType: 'PLI' | 'RPLI';
  sumAssured: number;
  initialPremium: number;
  remarks?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InsuranceContributionSchema: Schema = new Schema(
  {
    officialId: { type: Schema.Types.ObjectId, ref: 'Official', required: true },
    contributionDate: { type: Date, required: true },
    officeOfIndexing: { type: String, required: true },
    insuranceType: { type: String, enum: ['PLI', 'RPLI'], required: true },
    sumAssured: { type: Number, required: true, min: 0 },
    initialPremium: { type: Number, required: true, min: 0 },
    remarks: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

InsuranceContributionSchema.index({ officialId: 1 });
InsuranceContributionSchema.index({ contributionDate: -1 });
InsuranceContributionSchema.index({ officeOfIndexing: 1 });
InsuranceContributionSchema.index({ insuranceType: 1 });
InsuranceContributionSchema.index({ createdBy: 1 });
InsuranceContributionSchema.index({ contributionDate: -1, createdAt: -1 });

export const InsuranceContribution: Model<IInsuranceContribution> =
  mongoose.models.InsuranceContribution ||
  mongoose.model<IInsuranceContribution>('InsuranceContribution', InsuranceContributionSchema);

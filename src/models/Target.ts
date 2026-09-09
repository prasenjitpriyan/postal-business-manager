import mongoose, { Schema, Document, Model } from 'mongoose';
import { TargetCategory, MetricType } from '@/types/target';

export interface ITarget extends Document {
  title?: string;
  financialYear: string;
  month?: number | null;
  division: string;
  subDivision?: string;
  office?: string;
  officialId?: mongoose.Types.ObjectId;
  category: TargetCategory;
  metricType: MetricType;
  schemeType?: string;
  targetValue: number;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TargetSchema: Schema = new Schema(
  {
    title: { type: String, trim: true },
    financialYear: { type: String, required: true, trim: true, index: true },
    month: { type: Number, min: 1, max: 12, default: null, index: true },
    division: { type: String, default: 'Kolkata South Division', trim: true },
    subDivision: { type: String, trim: true },
    office: { type: String, trim: true, index: true },
    officialId: { type: Schema.Types.ObjectId, ref: 'Official', default: null, index: true },
    category: { type: String, enum: ['PLI', 'RPLI', 'POSB'], required: true, index: true },
    metricType: {
      type: String,
      enum: ['POLICIES_COUNT', 'SUM_ASSURED', 'INITIAL_PREMIUM', 'ACCOUNTS_COUNT'],
      required: true,
    },
    schemeType: { type: String, trim: true },
    targetValue: { type: Number, required: true, min: 1 },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

TargetSchema.index({ financialYear: 1, month: 1, category: 1 });
TargetSchema.index({ financialYear: 1, office: 1 });
TargetSchema.index({ financialYear: 1, officialId: 1 });

export const Target: Model<ITarget> =
  mongoose.models.Target || mongoose.model<ITarget>('Target', TargetSchema);

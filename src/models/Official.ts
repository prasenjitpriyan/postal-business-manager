import mongoose, { Document, Model, Schema } from 'mongoose'

import { OfficialStatus } from '@/types/official'

export interface IOfficial extends Document {
  name: string
  designation: string
  office: string
  phone: string
  email?: string
  employeeId?: string
  status: OfficialStatus
  joiningDate: Date
  createdAt: Date
  updatedAt: Date
}

const OfficialSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    office: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    employeeId: { type: String },
    status: { type: String, enum: Object.values(OfficialStatus), default: OfficialStatus.ACTIVE },
    joiningDate: { type: Date, required: true },
  },
  { timestamps: true }
)

// Clear mongoose model cache for hot reload in development
if (mongoose.models.Official) {
  delete mongoose.models.Official
}
export const Official: Model<IOfficial> = mongoose.model<IOfficial>('Official', OfficialSchema)

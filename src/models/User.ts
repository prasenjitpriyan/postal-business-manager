import mongoose, { Schema, Document, Model } from 'mongoose';

export enum Role {
  ADMIN = 'Admin',
  SUPERVISOR = 'Supervisor',
  VIEWER = 'Viewer',
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.VIEWER },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

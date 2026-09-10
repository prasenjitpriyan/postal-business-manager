import mongoose from 'mongoose';
import { User } from '@/models/User';
import { Official } from '@/models/Official';
import { Target } from '@/models/Target';
import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { ContactMessage } from '@/models/ContactMessage';
import { AuditLog } from '@/models/AuditLog';

// Ensure all models are initialized and registered in Mongoose schema cache
const _appModels = [
  User,
  Official,
  Target,
  BusinessContribution,
  InsuranceContribution,
  ContactMessage,
  AuditLog,
];
void _appModels;

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache as MongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

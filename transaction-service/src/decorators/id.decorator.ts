import { Types } from 'mongoose';

/**
 * Helper function to safely convert strings to MongoDB ObjectIds
 */
export function Id(value: string | Types.ObjectId): Types.ObjectId {
  if (typeof value === 'string') {
    return new Types.ObjectId(value);
  }
  return value;
} 
import { Document, Types } from 'mongoose';

export interface userType extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  role: string;
  status: string;
  confirmEmail: boolean;
  authTypes: Array<{
    type: string;
    authFor: string;
    value: string;
    expireAt?: Date;
  }>;
  defaultAcc: Types.ObjectId;
  socketId?: string;
  userName?: string;
} 
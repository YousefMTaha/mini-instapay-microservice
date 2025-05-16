import { Document, Types } from 'mongoose';

export interface Transaction extends Document {
  _id: Types.ObjectId;
  status: string;
  type: string;
  amount: number;
  accSenderId: Types.ObjectId;
  accReceiverId: Types.ObjectId;
  createdAt?: Date;
} 
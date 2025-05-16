import { Document, Types } from 'mongoose';

export interface Account extends Document {
  _id: Types.ObjectId;
  Balance: number;
  bankId: Types.ObjectId;
  userId: Types.ObjectId;
  cardId: Types.ObjectId;
  PIN: string;
  wrongPIN: number;
  limit: {
    type?: string;
    amount?: number;
    endDate?: Date | number;
    spent?: number;
  };
} 
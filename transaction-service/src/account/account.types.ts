import { Document, Types } from 'mongoose';
import { userType } from '../services/user.types';

export interface accountType extends Document {
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
  checkAmount?(amount: number): void;
  checkNoOfTries?(): boolean;
}

export interface PopulatedAccountType extends Omit<accountType, 'userId'> {
  userId: userType;
} 
import { Document, Types } from 'mongoose';
import { Transaction } from './transaction.schema';
import { PopulatedAccountType, accountType } from './account/account.types';

export type transactionType = Transaction & Document;

export interface PopulatedSenderTransaction extends Omit<transactionType, 'accSenderId'> {
  accSenderId: PopulatedAccountType;
}

export interface PopulatedReceiverTransaction extends Omit<transactionType, 'accReceiverId'> {
  accReceiverId: PopulatedAccountType;
}

export interface FullyPopulatedTransaction extends Omit<transactionType, 'accSenderId' | 'accReceiverId'> {
  accSenderId: PopulatedAccountType;
  accReceiverId: PopulatedAccountType;
}

export interface ErrorResponseData {
  message: string;
  status?: boolean;
  statusCode?: number;
} 
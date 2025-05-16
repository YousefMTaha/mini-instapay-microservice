import { Document, Types } from 'mongoose';

export class User {
  _id: Types.ObjectId;
  email: string;
  defaultAcc?: Types.ObjectId;
  authTypes: Array<{
    type: string;
    authFor: string;
    value?: string;
    expireAt?: Date;
  }>;
}

export type userType = User & Document;

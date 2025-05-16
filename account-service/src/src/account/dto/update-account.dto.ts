import { Type } from 'class-transformer';
import { IsMongoId, IsObject } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateAccountDTO {
  @IsMongoId()
  _id: Types.ObjectId;

  // Use a known property structure but allow other props
  @IsObject()
  limit?: {
    amount?: number;
    spent?: number;
    type?: string;
  };

  // Add other known account properties as needed
  Balance?: number;
} 
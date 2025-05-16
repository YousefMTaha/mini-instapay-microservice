import {
  IsMongoId,
  IsString,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';

export class RequestRefundDTO {
  @IsMongoId()
  transactionId: Types.ObjectId;

  @IsString()
  @MinLength(5, { message: 'Reason must be at least 5 characters long' })
  reason: string;
} 
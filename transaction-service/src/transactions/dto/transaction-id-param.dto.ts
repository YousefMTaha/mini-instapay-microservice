import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class TransactionIdParamDTO {
  @IsMongoId()
  transactionId: Types.ObjectId;
} 
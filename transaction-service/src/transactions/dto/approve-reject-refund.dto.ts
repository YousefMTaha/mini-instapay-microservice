import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class ApproveRejectRefundDTO {
  @IsMongoId()
  transactionId: Types.ObjectId;
} 
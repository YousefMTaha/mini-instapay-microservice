import { Type } from 'class-transformer';
import { IsMongoId, IsObject, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../../user.types';
import { Transaction } from '../../transaction.types';

export class RejectRefundDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  transaction: Transaction;

  @IsMongoId()
  sender: Types.ObjectId;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  receiver: User;
} 
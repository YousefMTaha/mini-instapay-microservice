import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { User } from '../../user.types';
import { Transaction } from '../../transaction.types';

export class ApproveRefundDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  transaction: Transaction;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  sender: User;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  receiver: User;
} 
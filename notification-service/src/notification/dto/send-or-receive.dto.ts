import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsObject, Min, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../../user.types';

export class SendOrReceiveDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  sender: User;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  receiver: User;

  @IsMongoId()
  transactionId: Types.ObjectId;

  @IsNumber()
  @Min(1)
  amount: number;
} 
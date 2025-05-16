import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString, MinLength, ValidateNested } from 'class-validator';
import { User } from '../../user.types';
import { Transaction } from '../../transaction.types';

export class RequestRefundDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  user: User;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  transaction: Transaction;

  @IsString()
  @MinLength(5, { message: 'Reason must be at least 5 characters long' })
  reason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  admins: User[];
} 
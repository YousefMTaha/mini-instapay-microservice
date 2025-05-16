import { Type } from 'class-transformer';
import { IsNumber, IsObject, Min, ValidateNested } from 'class-validator';
import { accountType } from '../account.types';

export class CheckLimitRequestDTO {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  account: accountType;
} 
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { Account } from '../../account.types';

// Since account type might be complex, we use IsObject and ValidateNested
export class WrongPinDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  account: Account;
} 
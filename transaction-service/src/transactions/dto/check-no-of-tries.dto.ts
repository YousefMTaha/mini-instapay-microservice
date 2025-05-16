import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { accountType } from '../../account/account.types';
import { userType } from '../../services/user.types';

export class CheckNoOfTriesDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  account: accountType;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  user: userType;
} 
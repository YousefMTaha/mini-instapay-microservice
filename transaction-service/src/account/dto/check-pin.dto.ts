import { Type } from 'class-transformer';
import { IsObject, IsString, Length, ValidateNested } from 'class-validator';
import { accountType } from '../account.types';

export class CheckPinRequestDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  user: {
    _id: string;
  };

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  account: accountType;

  @IsString()
  @Length(6, 6, { message: 'PIN must be 6 characters' })
  pin: string;
} 
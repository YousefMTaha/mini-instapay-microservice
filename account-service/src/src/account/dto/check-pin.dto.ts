import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

class AuthType {
  @IsString()
  type: string;

  @IsString()
  authFor: string;

  value?: string;
  expireAt?: Date;
}

class UserDTO {
  _id: Types.ObjectId;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsArray()
  @IsOptional()
  authTypes: AuthType[];

  [key: string]: any;
}

class AccountDTO {
  _id: Types.ObjectId;
  Balance: number;
  bankId: Types.ObjectId;
  userId: Types.ObjectId;
  cardId: Types.ObjectId;
  PIN: string;
  wrongPIN: number;
  limit: {
    type?: string;
    amount?: number;
    endDate?: Date | number;
    spent?: number;
  };

  [key: string]: any;
}

export class CheckPinDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => UserDTO)
  user: UserDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => AccountDTO)
  account: AccountDTO;

  @IsString()
  @Length(6, 6, { message: 'PIN must be 6 characters' })
  pin: string;
}

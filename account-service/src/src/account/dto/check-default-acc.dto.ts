import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
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
  defaultAcc: Types.ObjectId;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsArray()
  @IsOptional()
  authTypes: AuthType[];

  [key: string]: any; // Other user properties
}

export class CheckDefaultAccDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => UserDTO)
  user: UserDTO;

  @IsString()
  errMsg: string;
}

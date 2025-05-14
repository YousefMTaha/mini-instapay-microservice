import { IsEmail, IsMongoId, Length, Matches } from 'class-validator';
import { Types } from 'mongoose';
import {
  MOBILE_REGEX,
  MOBILE_REGEX_MSG,
  TOKEN_REGEX,
  TOKEN_REGEX_MSG,
} from '../Constants/system.constants';

export class OTPDTO {
  @Length(6, 6, { message: 'OTP must be 6 characters' })
  otp: string;
}

export class PINDTO {
  @Length(6, 6, { message: 'PIN must be 6 characters' })
  PIN: string;
}

export class EmailDTO {
  @IsEmail()
  email: string;
}

export class MobileDTO {
  @Matches(MOBILE_REGEX, { message: MOBILE_REGEX_MSG })
  mobileNumber: number;
}

export class TokenDTO {
  @Matches(TOKEN_REGEX, { message: TOKEN_REGEX_MSG })
  token: string;
}

export class ObjectIdDTO {
  @IsMongoId()
  id: Types.ObjectId;
}

export class TokenAndOTPDTO {
  @Length(6, 6, { message: 'OTP must be 6 characters' })
  otp: string;

  @Matches(TOKEN_REGEX, { message: TOKEN_REGEX_MSG })
  token: string;
}

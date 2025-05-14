import { IsEmail, IsMongoId, Length, Matches } from 'class-validator';
import { Types } from 'mongoose';

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

export class ObjectIdDTO {
  @IsMongoId()
  id: Types.ObjectId;
}

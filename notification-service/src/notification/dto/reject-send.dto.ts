import { IsEmail, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class RejectSendDTO {
  @IsEmail()
  email: string;

  @IsMongoId()
  receiverId: Types.ObjectId;

  @IsMongoId()
  transactionId: Types.ObjectId;
} 
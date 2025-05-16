import {
  IsMongoId,
  IsOptional,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';

export class ConfirmReceiveDTO {
  @Length(6, 6, { message: 'PIN must be 6 characters' })
  PIN: string;

  @IsMongoId()
  @IsOptional()
  accountId?: Types.ObjectId;
} 
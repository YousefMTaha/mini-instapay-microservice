import { IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class LowBalanceDTO {
  @IsString()
  cardNo: string;

  @IsMongoId()
  userId: Types.ObjectId;
} 
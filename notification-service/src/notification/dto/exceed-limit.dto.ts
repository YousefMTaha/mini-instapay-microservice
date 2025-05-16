import { IsMongoId, IsNumber, Min } from 'class-validator';
import { Types } from 'mongoose';

export class ExceedLimitDTO {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsMongoId()
  userId: Types.ObjectId;
} 
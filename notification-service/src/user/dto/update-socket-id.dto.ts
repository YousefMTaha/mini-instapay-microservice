import { IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateSocketIdDTO {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsString()
  socketId: string;
} 
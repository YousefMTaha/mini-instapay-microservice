import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class GetAccountRequestDTO {
  @IsMongoId()
  accountId: Types.ObjectId;
} 
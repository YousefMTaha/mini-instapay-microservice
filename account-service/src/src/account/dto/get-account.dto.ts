import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class GetAccountDTO {
  @IsMongoId()
  accountId: Types.ObjectId;
} 
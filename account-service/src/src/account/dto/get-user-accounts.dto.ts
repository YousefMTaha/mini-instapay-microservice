import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class GetUserAccountsDTO {
  @IsMongoId()
  userId: Types.ObjectId;
} 
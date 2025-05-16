import { IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AccountIdRequestDTO {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  accountId: Types.ObjectId;

  @IsString()
  errMsg: string;
} 
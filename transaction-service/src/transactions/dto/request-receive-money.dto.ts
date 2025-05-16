import {
  IsEmail,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class RequestReceiveMoneyDTO {
  @IsEmail()
  receiverData: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsMongoId()
  @IsOptional()
  accountId?: Types.ObjectId;
} 
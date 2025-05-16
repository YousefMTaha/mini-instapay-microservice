import { Type } from 'class-transformer';
import { IsNumber, IsObject, Min, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

class AccountDTO {
  _id: Types.ObjectId;
  Balance: number;
  bankId: Types.ObjectId;
  userId: Types.ObjectId;
  cardId: Types.ObjectId;
  PIN: string;
  wrongPIN: number;
  limit: {
    type?: string;
    amount?: number;
    endDate?: Date | number;
    spent?: number;
  };
  
  [key: string]: any; // Other account properties
}

export class CheckLimitDTO {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => AccountDTO)
  account: AccountDTO;
} 
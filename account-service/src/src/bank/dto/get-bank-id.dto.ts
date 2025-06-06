import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class BankIdDTO {
  @IsMongoId()
  bankId: Types.ObjectId;
}

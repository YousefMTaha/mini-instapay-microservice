import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CardIdDTO {
  @IsMongoId()
  cardId: Types.ObjectId;
} 
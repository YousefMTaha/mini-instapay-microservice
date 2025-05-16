import { IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class DateValidator {
  year: number;
  month: number;
}

export class AddCardDTO {
  @IsString()
  holderName: string;

  @IsString()
  @Length(16, 16, { message: 'Card number must be 16 characters' })
  cardNo: string;

  @ValidateNested()
  @Type(() => DateValidator)
  date: DateValidator;

  @IsString()
  @Length(3, 4, { message: 'CVV must be 3 or 4 characters' })
  CVV: string;
} 
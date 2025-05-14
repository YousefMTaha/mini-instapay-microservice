import { IsEnum, IsNumber, Min } from 'class-validator';
import { limitType } from 'src/account.constant';
export class UpdateLimitDTO {
  @IsEnum(limitType)
  type: limitType;

  @IsNumber()
  @Min(1)
  amount: number;
}

import { IsEmail } from 'class-validator';
import { TokenDTO } from 'utils/common/common.dto';

export class UpdateEmailDTO extends TokenDTO {
  @IsEmail()
  email: string;
}

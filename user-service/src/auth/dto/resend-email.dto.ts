import { IsEnum } from 'class-validator';
import { authForOptions } from 'src/user.constants';
import { TokenDTO } from 'utils/common/common.dto';

export class ResendMailDTO extends TokenDTO {
  @IsEnum(authForOptions)
  type: authForOptions;
}

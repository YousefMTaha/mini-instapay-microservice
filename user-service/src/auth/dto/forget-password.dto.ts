import { Matches } from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_REGEX_MSG } from 'src/user.constants';
import { TokenDTO } from 'utils/common/common.dto';

export class ForgetPasswordDTO extends TokenDTO {
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REGEX_MSG })
  password: string;
}

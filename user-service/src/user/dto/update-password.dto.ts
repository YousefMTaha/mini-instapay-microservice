import { Matches } from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_REGEX_MSG } from 'src/user.constants';
import { notMatch } from 'validators/not-match.validator';

export class UpdatePasswordDTO {
  @Matches(PASSWORD_REGEX, { message: 'Old ' + PASSWORD_REGEX_MSG })
  oldPassword: string;

  @Matches(PASSWORD_REGEX, { message: 'New ' + PASSWORD_REGEX_MSG })
  @notMatch('oldPassword')
  newPassword: string;
}

import { HttpException, HttpStatus } from '@nestjs/common';

export function checkForSendOTPDuration(time: Date) {
  const nowDateInMill = Date.now();
  const expireAtInMill = Date.parse(time.toUTCString());

  if (nowDateInMill < expireAtInMill) {
    throw new HttpException(
      `You can't ask for another OTP as there's already a valid one, you can try after ${(
        (expireAtInMill - nowDateInMill) /
        (60 * 1000)
      ).toFixed(2)} m `,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

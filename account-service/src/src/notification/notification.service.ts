import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { accountType } from '../schemas/account.schema';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationService {
  constructor(private readonly httpService: HttpService) {}

  async exceedLimit(amount: number, userId: Types.ObjectId) {
    const { data } = await firstValueFrom(
      this.httpService
        .post('http://notification-service:3003/notification/exceedLimit', {
          amount,
          userId,
        })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }

  async wrongPIN(account: accountType) {
    const { data } = await firstValueFrom(
      this.httpService
        .post('http://notification-service:3003/notification/wrongPIN', {
          account,
        })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
}

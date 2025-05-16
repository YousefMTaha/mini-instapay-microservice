import { BadRequestException, Injectable } from '@nestjs/common';
import { accountType } from '../schemas/account.schema';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { userType } from '../schemas/user.schema';

@Injectable()
export class TransactionService {
  constructor(private readonly httpService: HttpService) {}

  async checkNoOfTries(account: accountType, user: userType) {
    const { data } = await firstValueFrom(
      this.httpService
        .post('http://transaction-service:3005/transaction/checkNoOfTries', {
          account,
          user,
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

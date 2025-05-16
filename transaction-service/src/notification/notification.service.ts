import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { Types } from 'mongoose';
import { userType } from '../services/user.types';
import { transactionType } from '../transaction.schema';

@Injectable()
export class NotificationService {
  private baseUrl = 'http://notification-service:3003/notification';

  constructor(private readonly httpService: HttpService) {}

  async lowBalance(cardNo: string, userId: Types.ObjectId) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/lowBalance`, { cardNo, userId })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
  async receiveRequest(
    sender: userType,
    receiver: userType,
    transactionId: Types.ObjectId,
    amount: number,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/receiveRequest`, {
          sender,
          receiver,
          transactionId,
          amount,
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
  async sendOrReceive(
    sender: userType,
    receiver: userType,
    transactionId: Types.ObjectId,
    amount: number,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/sendOrReceive`, {
          sender,
          receiver,
          transactionId,
          amount,
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
  async rejectSend(
    email: string,
    receiverId: Types.ObjectId,
    transactionId: Types.ObjectId,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/rejectSend`, {
          email,
          receiverId,
          transactionId,
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
  async requestRefund(
    user: userType,
    transaction: transactionType,
    reason: string,
    admins: userType[],
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/requestRefund`, {
          user,
          transaction,
          reason,
          admins,
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
  async approveRefund(
    transaction: transactionType,
    sender: userType,
    receiver: userType,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/approveRefund`, {
          transaction,
          sender,
          receiver,
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
  async rejectRefund(
    transaction: transactionType,
    sender: userType,
    receiver: userType,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/rejectRefund`, {
          transaction,
          sender,
          receiver,
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

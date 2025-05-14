import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationService {
  private baseUrl = 'http://notification-service:3003/notification';

  constructor(private readonly httpService: HttpService) {}

  async lowBalance(cardNo, userId) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/low-balance`, { cardNo, userId })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
  async recieveRequest(sender, receiver, transactionId, amount) {
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
  async sendOrRecieve(sender, receiver, transactionId, amount) {
    console.log(sender, receiver, transactionId, amount);
    
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
  async rejectSend(email, accReceiverId, transactionId) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/rejectSend`, {
          email,
          accReceiverId,
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
  async requestRefund(user, transaction, reason, admins) {
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
  async approveRefund(transaction, sender, receiver) {
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
  async rejectRefund(transaction, sender, receiver) {
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

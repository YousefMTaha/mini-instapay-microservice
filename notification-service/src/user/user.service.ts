import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService) {}

  async updateSocketId(userId: any, socketId: any) {
    const { data } = await firstValueFrom(
      this.httpService
        .post('http://user-service:3001/user/updateSocketId', { userId, socketId })
        .pipe(
          catchError((error: AxiosError) => {
            const errorResponse = error.response?.data as any;
            const errorMessage = errorResponse?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
}

import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Types } from 'mongoose';
import { ErrorResponseData } from './user.types';
import { UpdateSocketIdDTO } from './dto/update-socket-id.dto';

@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService) {}

  async updateSocketId(userId: Types.ObjectId, socketId: string): Promise<{ message: string; status: boolean }> {
    const requestData: UpdateSocketIdDTO = { userId, socketId };
    
    const { data } = await firstValueFrom(
      this.httpService
        .post('http://user-service:3001/user/updateSocketId', requestData)
        .pipe(
          catchError((error: AxiosError) => {
            const errorResponse = error.response?.data as ErrorResponseData;
            const errorMessage = errorResponse?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
}

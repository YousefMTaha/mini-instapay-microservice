import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class MailService {
  constructor(private readonly httpService: HttpService) {}

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    const { data } = await firstValueFrom(
      this.httpService
        .post('http://mail-service:3002/mail-service', { to, subject, html })
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

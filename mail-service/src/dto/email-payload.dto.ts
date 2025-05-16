import { IsEmail, IsString, MinLength } from 'class-validator';

export class EmailPayloadDTO {
  @IsEmail()
  to: string;

  @IsString()
  @MinLength(3)
  subject: string;

  @IsString()
  @MinLength(5)
  html: string;
} 
import { Type } from 'class-transformer';
import { IsObject, IsString, ValidateNested } from 'class-validator';

export class DefaultAccRequestDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  user: {
    _id: string;
    defaultAcc: string;
  };

  @IsString()
  errMsg: string;
} 
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ExpressInterestDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

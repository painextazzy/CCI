
// src/announcements/dto/create-announcement.dto.ts
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateBy,
} from 'class-validator';
import { AnnouncementType } from '../entities/announcement.entity';

function isFutureDeadline(value: unknown): boolean {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    return false;
  }
  const deadlineDate = value.slice(0, 10);
  const currentDate = new Date().toISOString().slice(0, 10);
  return deadlineDate > currentDate;
}

export class CreateAnnouncementDto {
  @IsEnum(AnnouncementType)
  @IsNotEmpty()
  type: AnnouncementType; // OFFRE ou DEMANDE

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  category: string; // Ex: 'Sous-traitance', 'Distribution', etc.

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  specificLocation?: string;

  @IsDateString()
  @ValidateBy({
    name: 'isFutureDeadline',
    validator: {
      validate: isFutureDeadline,
      defaultMessage: () =>
        'La date limite doit être postérieure à la date actuelle.',
    },
  })
  @IsOptional()
  deadline?: string;
}
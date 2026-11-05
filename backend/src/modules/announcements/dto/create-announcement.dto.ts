
// src/announcements/dto/create-announcement.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { AnnouncementType } from '../entities/announcement.entity';

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
  @IsOptional()
  deadline?: string;
}
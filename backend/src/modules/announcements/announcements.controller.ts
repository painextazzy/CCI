import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express'; // 👈 Import du type Request d'Express
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: Request & { user: { company?: { id: string } | null } }) {
    const companyId = req.user?.company?.id;
    if (!companyId) {
      throw new UnauthorizedException(
        "Votre compte utilisateur n'est associé à aucune entreprise.",
      );
    }
    return this.announcementsService.findMine(companyId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createDto: CreateAnnouncementDto,
    @Req() req: Request & { user: any }, // 👈 Typage explicite pour inclure req.user
  ) {
    const company = req.user?.company;

    if (!company) {
      throw new UnauthorizedException(
        "Votre compte utilisateur n'est associé à aucune entreprise.",
      );
    }

    return this.announcementsService.create(createDto, company);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateMine(
    @Req() req: Request & { user: { company?: { id: string } | null } },
    @Body() updateDto: UpdateAnnouncementDto,
    @Param('id') id: string,
  ) {
    const companyId = req.user?.company?.id;
    if (!companyId) {
      throw new UnauthorizedException(
        "Votre compte utilisateur n'est associé à aucune entreprise.",
      );
    }
    return this.announcementsService.updateMine(id, companyId, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeMine(
    @Req() req: Request & { user: { company?: { id: string } | null } },
    @Param('id') id: string,
  ) {
    const companyId = req.user?.company?.id;
    if (!companyId) {
      throw new UnauthorizedException(
        "Votre compte utilisateur n'est associé à aucune entreprise.",
      );
    }
    await this.announcementsService.removeMine(id, companyId);
    return { message: 'Annonce supprimée avec succès.' };
  }
}
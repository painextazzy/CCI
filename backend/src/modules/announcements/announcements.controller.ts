import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express'; // 👈 Import du type Request d'Express
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CompanyContextService } from '../companies/company-context.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly companyContext: CompanyContextService,
  ) {}

  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@Req() req: Request & { user: { id: string } }) {
    const companyId = (await this.companyContext.getForUser(req.user.id)).id;
    return this.announcementsService.findMine(companyId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createDto: CreateAnnouncementDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    const company = await this.companyContext.getForUser(req.user.id);
    return this.announcementsService.create(createDto, company);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateMine(
    @Req() req: Request & { user: { id: string } },
    @Body() updateDto: UpdateAnnouncementDto,
    @Param('id') id: string,
  ) {
    const companyId = (await this.companyContext.getForUser(req.user.id)).id;
    return this.announcementsService.updateMine(id, companyId, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeMine(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    const companyId = (await this.companyContext.getForUser(req.user.id)).id;
    await this.announcementsService.removeMine(id, companyId);
    return { message: 'Annonce supprimée avec succès.' };
  }
}
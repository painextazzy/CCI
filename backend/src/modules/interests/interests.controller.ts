import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { InterestsService } from './interests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpressInterestDto } from './dto/express-interest.dto';
import type { Request } from 'express';

@Controller('interests')
@UseGuards(JwtAuthGuard)
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post(':announcementId')
  async expressInterest(
    @Param('announcementId') announcementId: string,
    @Body() body: ExpressInterestDto,
    @Req() req: Request & { user: { company?: { id: string } | null } },
  ) {
    const companyId = req.user?.company?.id;
    if (!companyId) throw new BadRequestException('Entreprise non identifiée.');
    return this.interestsService.expressInterest(
      announcementId,
      companyId,
      body.message,
    );
  }

  @Get('received')
  async getReceived(@Req() req: any) {
    const companyId = req.user?.company?.id;
    if (!companyId) throw new BadRequestException('Entreprise non identifiée.');
    return this.interestsService.getReceivedInterests(companyId);
  }

  @Get('sent')
  async getSent(@Req() req: any) {
    const companyId = req.user?.company?.id;
    if (!companyId) throw new BadRequestException('Entreprise non identifiée.');
    return this.interestsService.getSentInterests(companyId);
  }

  @Patch(':id/accept')
  async accept(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.company?.id;
    if (!companyId) throw new BadRequestException('Entreprise non identifiée.');
    return this.interestsService.respondToInterest(id, companyId, 'accept');
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.company?.id;
    if (!companyId) throw new BadRequestException('Entreprise non identifiée.');
    return this.interestsService.respondToInterest(id, companyId, 'reject');
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InterestsService } from './interests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpressInterestDto } from './dto/express-interest.dto';
import type { Request } from 'express';
import { CompanyContextService } from '../companies/company-context.service';

@Controller('interests')
@UseGuards(JwtAuthGuard)
export class InterestsController {
  constructor(
    private readonly interestsService: InterestsService,
    private readonly companyContext: CompanyContextService,
  ) {}

  @Post(':announcementId')
  async expressInterest(
    @Param('announcementId') announcementId: string,
    @Body() body: ExpressInterestDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    const companyId = (await this.companyContext.getForUser(req.user.id)).id;
    return this.interestsService.expressInterest(
      announcementId,
      companyId,
      body.message,
    );
  }

  @Get('received')
  async getReceived(@Req() req: Request & { user: { id: string } }) {
    const companyId = (await this.companyContext.getForUser(req.user.id)).id;
    return this.interestsService.getReceivedInterests(companyId);
  }

  @Get('sent')
  async getSent(@Req() req: Request & { user: { id: string } }) {
    const companyId = (await this.companyContext.getForUser(req.user.id)).id;
    return this.interestsService.getSentInterests(companyId);
  }

  @Patch(':id/accept')
  async accept(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    const companyId = (await this.companyContext.getForUser(req.user.id)).id;
    return this.interestsService.respondToInterest(id, companyId, 'accept');
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    const companyId = (await this.companyContext.getForUser(req.user.id)).id;
    return this.interestsService.respondToInterest(id, companyId, 'reject');
  }
}

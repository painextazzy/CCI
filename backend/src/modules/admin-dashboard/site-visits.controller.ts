import { Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { SiteVisit } from './entities/site-visit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('site-visits')
@UseGuards(ThrottlerGuard)
export class SiteVisitsController {
  constructor(
    @InjectRepository(SiteVisit)
    private readonly siteVisitRepository: Repository<SiteVisit>,
  ) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async recordVisit(): Promise<void> {
    await this.siteVisitRepository.save(this.siteVisitRepository.create());
  }
}

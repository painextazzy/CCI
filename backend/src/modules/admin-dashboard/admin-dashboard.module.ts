import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../auth/auth.module';
import { Announcement } from '../announcements/entities/announcement.entity';
import { Company } from '../companies/entities/company.entity';
import { Contract } from '../messages/entities/contract.entity';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDataBackupController } from './admin-data-backup.controller';
import { AdminDataBackupService } from './admin-data-backup.service';
import { SiteVisit } from './entities/site-visit.entity';
import { SiteVisitsController } from './site-visits.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Announcement, Contract, SiteVisit]),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    AuthModule,
  ],
  controllers: [
    AdminDashboardController,
    AdminDataBackupController,
    SiteVisitsController,
  ],
  providers: [AdminDashboardService, AdminDataBackupService],
})
export class AdminDashboardModule {}

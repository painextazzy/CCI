import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { AdminDashboardService } from './admin-dashboard.service';
import type { DashboardPeriod } from './admin-dashboard.service';

function isDashboardPeriod(period: string): period is DashboardPeriod {
  return period === 'day' || period === 'week' || period === 'month';
}

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.CCI_STAFF)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('statistics')
  getStatistics(@Query('period') period?: string) {
    // Aucune période fournie → valeur par défaut
    if (!period) {
      return this.adminDashboardService.getStatistics('month');
    }

    // Période fournie mais invalide → 400
    if (!isDashboardPeriod(period)) {
      throw new BadRequestException('La période doit être day, week ou month.');
    }

    // Période validée → typée DashboardPeriod
    return this.adminDashboardService.getStatistics(period);
  }

  @Get('contracts')
  getContracts() {
    return this.adminDashboardService.getContracts();
  }

  @Get('announcements')
  getAllAnnouncements() {
    return this.adminDashboardService.getAllAnnouncements();
  }

  @Get('notifications')
  getNotifications() {
    return this.adminDashboardService.getNotifications();
  }
}

import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import {
  AdminDataBackupService,
  type DatabaseBackup,
} from './admin-data-backup.service';

@Controller('admin/data')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDataBackupController {
  constructor(private readonly backupService: AdminDataBackupService) {}

  @Get('backup')
  createBackup(): Promise<DatabaseBackup> {
    return this.backupService.createBackup();
  }

  @Post('restore')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  restoreBackup(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('Veuillez sélectionner un fichier JSON.');
    }
    return this.backupService.restoreBackup(file.buffer);
  }
}

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { VerificationStatus } from './entities/company.entity';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

class UpdateCompanyStatusDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  @MinLength(1)
  rejectionReason?: string;
}

class ApproveCompaniesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  companyIds: string[];
}

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Patch('status/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CCI_STAFF)
  approveMany(@Body() body: ApproveCompaniesDto) {
    return this.companiesService.approveMany(body.companyIds);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CCI_STAFF)
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateCompanyStatusDto,
  ) {
    return this.companiesService.updateStatus(
      id,
      body.status,
      body.rejectionReason?.trim(),
    );
  }
}
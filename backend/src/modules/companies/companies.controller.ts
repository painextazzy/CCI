import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { VerificationStatus } from './entities/company.entity';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

class UpdateCompanyStatusDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  @MinLength(1)
  rejectionReason?: string;
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

  @Patch(':id/status')
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
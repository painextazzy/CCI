import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { MailService } from '../../mail/email.service';
import { User } from '../users/entities/user.entity';
import { CompanyContextService } from './company-context.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User])],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyContextService, MailService],
  exports: [CompaniesService, CompanyContextService, TypeOrmModule],
})
export class CompaniesModule {}
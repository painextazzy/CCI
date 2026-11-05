import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from './entities/interest.entity';
import { Announcement } from '../announcements/entities/announcement.entity';
import { Company } from '../companies/entities/company.entity'; // 👈 Import de Company
import { Contract } from '../messages/entities/contract.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { InterestsGateway } from './interests.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interest, Announcement, Company, Contract, User]),
    AuthModule,
  ],
  controllers: [InterestsController],
  providers: [InterestsService, InterestsGateway],
  exports: [InterestsService, InterestsGateway],
})
export class InterestsModule {}

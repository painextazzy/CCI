import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Interest } from '../interests/entities/interest.entity';
import { Company } from '../companies/entities/company.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Contract } from './entities/contract.entity';
import { ContractsPdfService } from './contracts-pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Interest, Company, User, Contract]),
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, ContractsPdfService],
  exports: [MessagesService],
})
export class MessagesModule {}

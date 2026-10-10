import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './email.service';

@Module({
  imports: [ConfigModule],
  providers: [MailService],
  exports: [MailService], // Très important pour pouvoir l'injecter dans d'autres modules (ex: CompaniesModule)
})
export class MailModule {}
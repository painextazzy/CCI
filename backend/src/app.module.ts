import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { APP_GUARD } from '@nestjs/core';
import { User } from './modules/users/entities/user.entity';
import { Company } from './modules/companies/entities/company.entity';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { Announcement } from './modules/announcements/entities/announcement.entity';
import { InterestsModule } from './modules/interests/interests.module';
import { Interest } from './modules/interests/entities/interest.entity';
import { MessagesModule } from './modules/messages/messages.module';
import { Message } from './modules/messages/entities/message.entity';
import { Contract } from './modules/messages/entities/contract.entity';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { SiteVisit } from './modules/admin-dashboard/entities/site-visit.entity';

@Module({
  imports: [
    // 1. Charger les variables d'environnement (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Fenêtre de 1 minute (60 000 ms)
        limit: 60, // Max 60 requêtes par minute par IP
      },
    ]),

    // 2. Connexion TypeORM à PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'cci_b2b_db'),
        entities: [
          User,
          Company,
          Announcement,
          Interest,
          Message,
          Contract,
          SiteVisit,
        ],

        synchronize: true, // À mettre sur false en production
      }),
    }),

    // 3. Tes modules applicatifs
    UsersModule,
    CompaniesModule,
    AuthModule,
    CloudinaryModule,
    AnnouncementsModule,
    InterestsModule,
    MessagesModule,
    AdminDashboardModule,
  ],
})
export class AppModule {}

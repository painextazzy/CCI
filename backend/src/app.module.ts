import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';

import { User } from './modules/users/entities/user.entity';
import { Company } from './modules/companies/entities/company.entity';

@Module({
  imports: [
    // 1. Charger les variables d'environnement (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

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
        entities: [User, Company], // Ou [__dirname + '/**/*.entity{.ts,.js}']
        synchronize: true, // À mettre sur false en production
      }),
    }),

    // 3. Tes modules applicatifs
    UsersModule,
    CompaniesModule,
    AuthModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
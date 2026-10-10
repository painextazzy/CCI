import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { Company, VerificationStatus } from '../companies/entities/company.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export type CompanyRegistrationFiles = {
  kbisFile?: Express.Multer.File[];
  logoFile?: Express.Multer.File[];
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: { id: true, email: true, password: true, role: true, isActive: true },
      relations: { company: true },
    });

    if (!user?.password || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Votre compte est en attente de vérification ou a été désactivé par la CCI',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company: user.company || null,
      },
    };
  }

  async registerCompany(dto: RegisterCompanyDto, files?: CompanyRegistrationFiles) {
    // 1. Vérifications préliminaires
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail');
    }

    const existingNif = await this.companyRepository.findOne({ where: { nif: dto.nif } });
    if (existingNif) {
      throw new ConflictException('Une entreprise est déjà enregistrée avec ce NIF');
    }

    // 2. Traitement des fichiers via Cloudinary
    let kbisUrl: string | null = null;
    let logoUrl: string | null = null;

    try {
      if (files?.kbisFile && files.kbisFile[0]) {
        const kbisResult = await this.cloudinaryService.uploadFile(
          files.kbisFile[0],
          'cci_kbis_documents',
        );
        kbisUrl = kbisResult.secure_url;
      }

      if (files?.logoFile && files.logoFile[0]) {
        const logoResult = await this.cloudinaryService.uploadFile(
          files.logoFile[0],
          'cci_company_logos',
        );
        logoUrl = logoResult.secure_url;
      }
    } catch (uploadError) {
      console.error('Erreur lors du téléversement sur Cloudinary :', uploadError);
      throw new InternalServerErrorException(
        'Échec du téléversement des documents sur le serveur distant.',
      );
    }

    // 3. Transactions BDD
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Création de l'utilisateur (Compte désactivé par défaut en attente de validation CCI)
      const user = queryRunner.manager.create(User, {
        email: dto.email,
        password: hashedPassword,
        role: UserRole.COMPANY,
        isActive: false, // Inactif jusqu'à approbation administrative
      });
      const savedUser = await queryRunner.manager.save(user);

      // Création de la fiche Entreprise
      const company = queryRunner.manager.create(Company);
      Object.assign(company, {
        userId: savedUser.id,
        companyType: dto.companyType,
        companyName: dto.companyName,
        nif: dto.nif,
        stat: dto.stat,

        address: dto.address,
        managerName: dto.managerName,
        managerRole: dto.managerRole,
        phone: dto.phone,
        website: dto.website || null,
        sector: dto.sector,
        sectorOther: dto.sectorOther || null,
        needsDescription: dto.needsDescription,
        agreedTerms: dto.agreedTerms,
        kbisUrl: kbisUrl, // Link Cloudinary
        logoUrl: logoUrl, // Link Cloudinary
        verificationStatus: VerificationStatus.PENDING,
      });

      await queryRunner.manager.save(company);
      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        message: 'Inscription réussie. Votre dossier est en cours de vérification par la CCI.',
        userId: savedUser.id,
      };
    } catch (dbError) {
      await queryRunner.rollbackTransaction();
      console.error('Erreur lors de la transaction :', dbError);
      throw new InternalServerErrorException('Erreur lors de la création du compte entreprise');
    } finally {
      await queryRunner.release();
    }
  }
}
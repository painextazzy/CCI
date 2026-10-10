import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, VerificationStatus } from './entities/company.entity';
import { MailService } from '../../mail/email.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: MailService,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.user', 'user')
      .orderBy('company.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Company> {
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.user', 'user')
      .where('company.id = :id', { id })
      .getOne();

    if (!company) {
      throw new NotFoundException('Entreprise introuvable');
    }
    return company;
  }

  async updateStatus(
    id: string,
    status: VerificationStatus,
    rejectionReason?: string,
  ): Promise<Company> {
    const company = await this.findById(id);
    const isAlreadyApproved =
      company.verificationStatus === VerificationStatus.APPROVED;

    if (
      status === VerificationStatus.APPROVED &&
      isAlreadyApproved &&
      company.user?.isActive
    ) {
      return company;
    }

    if (status === VerificationStatus.REJECTED) {
      if (!rejectionReason) {
        throw new BadRequestException('Le motif du refus est requis');
      }
      const user = company.user;
      if (!user) {
        throw new BadRequestException(
          "L'entreprise n'est associée à aucun utilisateur",
        );
      }
      if (
        company.verificationStatus === VerificationStatus.REJECTED &&
        company.rejectionReason === rejectionReason
      ) {
        await this.userRepository.delete(user.id);
        return company;
      }

      const email = user.email;
      if (!email) {
        throw new BadRequestException("L'entreprise n'a pas d'adresse e-mail");
      }
      await this.emailService.sendCompanyRejectionEmail(
        email,
        company.companyName,
        rejectionReason,
      );
      await this.userRepository.delete(user.id);
      return company;
    } else {
      company.rejectionReason = null;
      if (status === VerificationStatus.APPROVED) {
        const user = company.user;
        if (!user) {
          throw new BadRequestException(
            "L'entreprise n'est associée à aucun utilisateur",
          );
        }

        const email = user.email;
        if (!email) {
          throw new BadRequestException("L'entreprise n'a pas d'adresse e-mail");
        }
        if (!isAlreadyApproved) {
          await this.emailService.sendCompanyApprovalEmail(
            email,
            company.companyName,
          );
        }
        user.isActive = true;
        await this.userRepository.save(user);
      }
    }

    company.verificationStatus = status;
    return this.companyRepository.save(company);
  }
}
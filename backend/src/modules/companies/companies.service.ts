import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, VerificationStatus } from './entities/company.entity';
import { MailService } from '../../mail/email.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

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
      const alreadyRejectedWithSameReason =
        company.verificationStatus === VerificationStatus.REJECTED &&
        company.rejectionReason === rejectionReason &&
        !user?.isActive;

      company.verificationStatus = VerificationStatus.REJECTED;
      company.rejectionReason = rejectionReason;
      const savedCompany = await this.companyRepository.save(company);

      if (user?.isActive) {
        user.isActive = false;
        await this.userRepository.save(user);
      }

      if (!alreadyRejectedWithSameReason && user?.email) {
        await this.sendNotificationWithoutBlocking(
          `Unable to send rejection email to ${user.email}`,
          () =>
            this.emailService.sendCompanyRejectionEmail(
              user.email,
              company.companyName,
              rejectionReason,
            ),
        );
      }
      return savedCompany;
    } else {
      company.rejectionReason = null;
      if (status === VerificationStatus.APPROVED) {
        const user = company.user;
        if (!user) {
          throw new BadRequestException(
            "L'entreprise n'est associée à aucun utilisateur",
          );
        }

        user.isActive = true;
        await this.userRepository.save(user);
        company.verificationStatus = status;
        const savedCompany = await this.companyRepository.save(company);

        if (!isAlreadyApproved && user.email) {
          await this.sendNotificationWithoutBlocking(
            `Unable to send approval email to ${user.email}`,
            () =>
              this.emailService.sendCompanyApprovalEmail(
                user.email,
                company.companyName,
              ),
          );
        }
        return savedCompany;
      }
    }

    company.verificationStatus = status;
    return this.companyRepository.save(company);
  }

  private async sendNotificationWithoutBlocking(
    message: string,
    send: () => Promise<unknown>,
  ): Promise<void> {
    try {
      await send();
    } catch (error) {
      this.logger.error(
        `${message}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
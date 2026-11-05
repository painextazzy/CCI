import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company, VerificationStatus } from './entities/company.entity';
import { MailService } from '../../mail/email.service';
import { User } from '../users/entities/user.entity';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepository: { save: jest.Mock };
  let userRepository: { save: jest.Mock; delete: jest.Mock };
  let mailService: {
    sendCompanyRejectionEmail: jest.Mock;
    sendCompanyApprovalEmail: jest.Mock;
  };

  beforeEach(async () => {
    companyRepository = {
      save: jest.fn(),
    };
    userRepository = {
      save: jest.fn().mockImplementation(async (user) => user),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mailService = {
      sendCompanyRejectionEmail: jest.fn().mockResolvedValue(undefined),
      sendCompanyApprovalEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: MailService,
          useValue: mailService, // On injecte un mock pour éviter d'appler de vrais e-mails pendant les tests
        },
        {
          provide: getRepositoryToken(Company),
          useValue: companyRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws an error if rejection reason is missing when rejecting', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: {
        id: 'user-id',
        email: 'contact@example.com',
        isActive: false,
      },
      verificationStatus: VerificationStatus.PENDING,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);

    await expect(
      service.updateStatus(company.id, VerificationStatus.REJECTED),
    ).rejects.toThrow(BadRequestException);
  });

  it('sends the rejection email and deletes the user and cascaded company', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: {
        id: 'user-id',
        email: 'contact@example.com',
        isActive: false,
      },
      verificationStatus: VerificationStatus.PENDING,
      rejectionReason: null,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);
    companyRepository.save.mockResolvedValue(company);

    await service.updateStatus(
      company.id,
      VerificationStatus.REJECTED,
      'Document illisible',
    );

    expect(mailService.sendCompanyRejectionEmail).toHaveBeenCalledWith(
      'contact@example.com',
      'Entreprise test',
      'Document illisible',
    );
    expect(userRepository.delete).toHaveBeenCalledWith('user-id');
    expect(companyRepository.save).not.toHaveBeenCalled();
  });

  it('deletes an already rejected company user without sending another email', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: { id: 'user-id', email: 'contact@example.com', isActive: false },
      verificationStatus: VerificationStatus.REJECTED,
      rejectionReason: 'Document illisible',
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);

    await service.updateStatus(
      company.id,
      VerificationStatus.REJECTED,
      'Document illisible',
    );

    expect(mailService.sendCompanyRejectionEmail).not.toHaveBeenCalled();
    expect(userRepository.delete).toHaveBeenCalledWith('user-id');
    expect(companyRepository.save).not.toHaveBeenCalled();
  });

  it('sends the approval email and persists the approved status', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: { email: 'contact@example.com' },
      verificationStatus: VerificationStatus.PENDING,
      rejectionReason: null,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);
    companyRepository.save.mockResolvedValue(company);

    await service.updateStatus(company.id, VerificationStatus.APPROVED);

    expect(mailService.sendCompanyApprovalEmail).toHaveBeenCalledWith(
      'contact@example.com',
      'Entreprise test',
    );
    expect(companyRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationStatus: VerificationStatus.APPROVED,
        rejectionReason: null,
      }),
    );
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
  });

  it('does not resend the approval email when the company is already approved', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: { email: 'contact@example.com', isActive: true },
      verificationStatus: VerificationStatus.APPROVED,
      rejectionReason: null,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);

    await service.updateStatus(company.id, VerificationStatus.APPROVED);

    expect(mailService.sendCompanyApprovalEmail).not.toHaveBeenCalled();
    expect(companyRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('activates the user without resending email when an approved company user is inactive', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: { email: 'contact@example.com', isActive: false },
      verificationStatus: VerificationStatus.APPROVED,
      rejectionReason: null,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);
    companyRepository.save.mockResolvedValue(company);

    await service.updateStatus(company.id, VerificationStatus.APPROVED);

    expect(mailService.sendCompanyApprovalEmail).not.toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
  });
});
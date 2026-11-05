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
  let userRepository: { save: jest.Mock };
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

  it('persists rejection status and reason and deactivates the user', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: {
        id: 'user-id',
        email: 'contact@example.com',
        isActive: true,
      },
      verificationStatus: VerificationStatus.PENDING,
      rejectionReason: null,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);
    companyRepository.save.mockImplementation(async (value) => value);

    const result = await service.updateStatus(
      company.id,
      VerificationStatus.REJECTED,
      'Document illisible',
    );

    expect(result.verificationStatus).toBe(VerificationStatus.REJECTED);
    expect(result.rejectionReason).toBe('Document illisible');
    expect(companyRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationStatus: VerificationStatus.REJECTED,
        rejectionReason: 'Document illisible',
      }),
    );
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
    expect(mailService.sendCompanyRejectionEmail).toHaveBeenCalledWith(
      'contact@example.com',
      'Entreprise test',
      'Document illisible',
    );
  });

  it('does not resend an email for an unchanged rejection', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: { id: 'user-id', email: 'contact@example.com', isActive: false },
      verificationStatus: VerificationStatus.REJECTED,
      rejectionReason: 'Document illisible',
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);
    companyRepository.save.mockImplementation(async (value) => value);

    await service.updateStatus(
      company.id,
      VerificationStatus.REJECTED,
      'Document illisible',
    );

    expect(mailService.sendCompanyRejectionEmail).not.toHaveBeenCalled();
    expect(companyRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationStatus: VerificationStatus.REJECTED,
        rejectionReason: 'Document illisible',
      }),
    );
  });

  it('persists approval and activates the user before sending email', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: { email: 'contact@example.com' },
      verificationStatus: VerificationStatus.PENDING,
      rejectionReason: null,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);
    companyRepository.save.mockImplementation(async (value) => value);

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

  it('keeps approval when the approval email fails', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: { email: 'contact@example.com', isActive: false },
      verificationStatus: VerificationStatus.PENDING,
      rejectionReason: null,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);
    companyRepository.save.mockImplementation(async (value) => value);
    mailService.sendCompanyApprovalEmail.mockRejectedValue(
      new Error('SMTP indisponible'),
    );

    await expect(
      service.updateStatus(company.id, VerificationStatus.APPROVED),
    ).resolves.toEqual(
      expect.objectContaining({
        verificationStatus: VerificationStatus.APPROVED,
      }),
    );
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
    expect(companyRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationStatus: VerificationStatus.APPROVED,
      }),
    );
  });

  it('keeps rejection when the rejection email fails', async () => {
    const company = {
      id: 'company-id',
      companyName: 'Entreprise test',
      user: {
        id: 'user-id',
        email: 'contact@example.com',
        isActive: true,
      },
      verificationStatus: VerificationStatus.PENDING,
      rejectionReason: null,
    } as Company;

    jest.spyOn(service, 'findById').mockResolvedValue(company);
    companyRepository.save.mockImplementation(async (value) => value);
    mailService.sendCompanyRejectionEmail.mockRejectedValue(
      new Error('SMTP indisponible'),
    );

    await expect(
      service.updateStatus(
        company.id,
        VerificationStatus.REJECTED,
        'Document illisible',
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        verificationStatus: VerificationStatus.REJECTED,
        rejectionReason: 'Document illisible',
      }),
    );
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
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
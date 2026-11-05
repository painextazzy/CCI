import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyContextService } from './company-context.service';

describe('CompanyContextService', () => {
  let service: CompanyContextService;
  const companyRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyContextService,
        {
          provide: getRepositoryToken(Company),
          useValue: companyRepository,
        },
      ],
    }).compile();

    service = module.get<CompanyContextService>(CompanyContextService);
  });

  it('resolves an authenticated user to their company by foreign key', async () => {
    companyRepository.findOne.mockResolvedValue({ id: 'company-id' });

    await expect(service.getForUser('user-id')).resolves.toEqual({
      id: 'company-id',
    });
    expect(companyRepository.findOne).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
    });
  });

  it('rejects users without an associated company', async () => {
    companyRepository.findOne.mockResolvedValue(null);

    await expect(service.getForUser('user-id')).rejects.toThrow(
      ForbiddenException,
    );
  });
});

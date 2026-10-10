import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { VerificationStatus } from '../companies/entities/company.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let queryBuilder: {
    innerJoinAndSelect: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    getMany: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns only company users with approved companies', async () => {
    await service.findAll();

    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'user.company',
      'company',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith('user.role = :role', {
      role: UserRole.COMPANY,
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'company.verificationStatus = :verificationStatus',
      { verificationStatus: VerificationStatus.APPROVED },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      'company.createdAt',
      'DESC',
    );
  });
});

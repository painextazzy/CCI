import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { VerificationStatus } from '../companies/entities/company.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let queryBuilder: {
    innerJoinAndSelect: jest.Mock;
    leftJoinAndSelect: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    getMany: jest.Mock;
    getOne: jest.Mock;
  };
  let userRepository: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn(),
    };
    userRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      create: jest.fn((values) => values),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
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

  it('deactivates an existing member', async () => {
    const user = {
      id: 'member-id',
      isActive: true,
      role: UserRole.COMPANY,
      company: { verificationStatus: VerificationStatus.APPROVED },
    } as User;
    queryBuilder.getOne.mockResolvedValue(user);

    await service.suspend(user.id);

    expect(user.isActive).toBe(false);
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  it('creates an active admin account with a normalized email', async () => {
    userRepository.save.mockImplementation(async (user: User) => ({
      ...user,
      id: 'admin-id',
    }));

    await expect(
      service.createAdmin({ email: '  ADMIN@EXAMPLE.COM ', password: 'secret1' }),
    ).resolves.toEqual({
      id: 'admin-id',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      isActive: true,
    });
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        isActive: true,
        password: expect.not.stringMatching(/^secret1$/),
      }),
    );
  });

  it('rejects creating an admin account with an existing email', async () => {
    userRepository.findOne.mockResolvedValue({ id: 'existing-id' });

    await expect(
      service.createAdmin({ email: 'admin@example.com', password: 'secret1' }),
    ).rejects.toThrow('Un compte existe déjà avec cet e-mail.');
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});

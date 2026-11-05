import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Announcement } from '../announcements/entities/announcement.entity';
import {
  Company,
  CompanyType,
} from '../companies/entities/company.entity';
import { Contract } from '../messages/entities/contract.entity';
import { SiteVisit } from './entities/site-visit.entity';
import { AdminDashboardService } from './admin-dashboard.service';

interface MockQueryBuilder {
  leftJoin: jest.Mock;
  innerJoin: jest.Mock;
  select: jest.Mock;
  addSelect: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  groupBy: jest.Mock;
  orderBy: jest.Mock;
  take: jest.Mock;
  setParameters: jest.Mock;
  getRawMany: jest.Mock;
  getCount: jest.Mock;
}

function createQueryBuilder(): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    leftJoin: jest.fn(),
    innerJoin: jest.fn(),
    select: jest.fn(),
    addSelect: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    groupBy: jest.fn(),
    orderBy: jest.fn(),
    take: jest.fn(),
    setParameters: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
  };

  for (const method of [
    builder.leftJoin,
    builder.innerJoin,
    builder.select,
    builder.addSelect,
    builder.where,
    builder.andWhere,
    builder.groupBy,
    builder.orderBy,
    builder.take,
    builder.setParameters,
  ]) {
    method.mockReturnValue(builder);
  }

  return builder;
}

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let companyRepository: { createQueryBuilder: jest.Mock; count: jest.Mock };
  let contractRepository: { createQueryBuilder: jest.Mock };
  let siteVisitRepository: { count: jest.Mock };
  let announcementRepository: { createQueryBuilder: jest.Mock };
  let accountQuery: MockQueryBuilder;
  let contractCountQuery: MockQueryBuilder;
  let economicQuery: MockQueryBuilder;
  let contractListQuery: MockQueryBuilder;
  let announcementQuery: MockQueryBuilder;
  let pendingCompaniesQuery: MockQueryBuilder;
  let partnershipAnnouncementsQuery: MockQueryBuilder;
  let pendingRequestsQuery: MockQueryBuilder;
  let siteVisitQuery: MockQueryBuilder;

  beforeEach(async () => {
    accountQuery = createQueryBuilder();
    contractCountQuery = createQueryBuilder();
    economicQuery = createQueryBuilder();
    contractListQuery = createQueryBuilder();
    announcementQuery = createQueryBuilder();
    pendingCompaniesQuery = createQueryBuilder();
    partnershipAnnouncementsQuery = createQueryBuilder();
    pendingRequestsQuery = createQueryBuilder();
    siteVisitQuery = createQueryBuilder();

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const previousMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    )
      .toISOString()
      .slice(0, 7);

    accountQuery.getRawMany.mockResolvedValue([
      { companyType: CompanyType.HAUTE_MATSIATRA, count: '2' },
      { companyType: CompanyType.OTHER_REGION, count: '3' },
      { companyType: CompanyType.INTERNATIONAL, count: '4' },
    ]);
    contractCountQuery.getCount.mockResolvedValue(6);
    pendingRequestsQuery.getCount.mockResolvedValue(5);
    siteVisitQuery.getCount.mockResolvedValue(123);
    economicQuery.getRawMany.mockResolvedValue([
      { month: previousMonth, amount: '120000' },
      { month: currentMonth, amount: '200000' },
    ]);
    contractListQuery.getRawMany.mockResolvedValue([
      {
        id: 'contract-1',
        reference: 'CCI-2026-ABC12345',
        senderCompanyName: 'Entreprise A',
        receiverCompanyName: 'Entreprise B',
        title: 'Fourniture',
        description: 'Détail du partenariat',
        amount: '120000',
        startDate: '2026-10-01',
        endDate: '2026-12-01',
        status: 'IN_PROGRESS',
        senderCompanyLogoUrl: null,
        senderLogoUrl: 'https://example.com/sender-logo.png',
        senderAvatarUrl: 'https://example.com/sender-avatar.png',
        receiverCompanyLogoUrl: 'https://example.com/receiver-saved.png',
        receiverLogoUrl: 'https://example.com/receiver-logo.png',
        receiverAvatarUrl: null,
      },
    ]);
    announcementQuery.getRawMany.mockResolvedValue([
      { status: 'OPEN', count: '7' },
      { status: 'IN_PROGRESS', count: '3' },
      { status: 'CLOSED', count: '2' },
    ]);

    companyRepository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(accountQuery)
        .mockReturnValueOnce(pendingRequestsQuery)
        .mockReturnValue(pendingCompaniesQuery),
      count: jest.fn().mockResolvedValue(5),
    };
    contractRepository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(contractCountQuery)
        .mockReturnValueOnce(economicQuery)
        .mockReturnValueOnce(contractListQuery),
    };
    siteVisitRepository = {
      count: jest.fn().mockResolvedValue(123),
      createQueryBuilder: jest.fn().mockReturnValue(siteVisitQuery),
    };
    announcementRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(announcementQuery),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: getRepositoryToken(Company),
          useValue: companyRepository,
        },
        {
          provide: getRepositoryToken(Announcement),
          useValue: announcementRepository,
        },
        {
          provide: getRepositoryToken(Contract),
          useValue: contractRepository,
        },
        {
          provide: getRepositoryToken(SiteVisit),
          useValue: siteVisitRepository,
        },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
  });

  it('returns account, request, contract, announcement and economic statistics', async () => {
    const statistics = await service.getStatistics();

    expect(statistics.accounts).toEqual({
      local: 2,
      external: 3,
      total: 5,
    });
    expect(statistics.pendingRequests).toBe(5);
    expect(statistics.siteVisits).toBe(123);
    expect(statistics.contractsInProgress).toBe(6);
    expect(statistics.announcements).toEqual({
      active: 7,
      inProgress: 3,
      closed: 2,
      total: 12,
    });
    expect(statistics.economicEvolution).toHaveLength(6);
    expect(statistics.economicEvolution.at(-2)).toEqual({
      month: new Date(
        Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1),
      )
        .toISOString()
        .slice(0, 7),
      amount: '120000',
    });
    expect(statistics.economicEvolution.at(-1)?.amount).toBe('200000');
    expect(accountQuery.where).toHaveBeenCalledWith('user.role = :role', {
      role: 'COMPANY',
    });
    expect(accountQuery.andWhere).toHaveBeenCalledWith(
      'company.companyType != :internationalType',
      { internationalType: CompanyType.INTERNATIONAL },
    );
    expect(accountQuery.andWhere).toHaveBeenCalledWith(
      'company.createdAt >= :periodStart AND company.createdAt < :periodEnd',
      expect.objectContaining({ periodStart: expect.any(Date), periodEnd: expect.any(Date) }),
    );
    expect(siteVisitQuery.where).toHaveBeenCalledWith(
      'siteVisit.visitedAt >= :periodStart AND siteVisit.visitedAt < :periodEnd',
      expect.objectContaining({ periodStart: expect.any(Date), periodEnd: expect.any(Date) }),
    );
    expect(pendingRequestsQuery.andWhere).toHaveBeenCalledWith(
      'company.createdAt >= :periodStart AND company.createdAt < :periodEnd',
      expect.objectContaining({ periodStart: expect.any(Date), periodEnd: expect.any(Date) }),
    );
    expect(contractCountQuery.andWhere).toHaveBeenCalledWith(
      'contract.startDate <= CURRENT_DATE',
    );
    expect(contractCountQuery.andWhere).toHaveBeenCalledWith(
      'contract.endDate >= CURRENT_DATE',
    );
    expect(contractCountQuery.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('contract.acceptedAt'),
      expect.anything(),
    );
    expect(announcementQuery.where).toHaveBeenCalledWith(
      'announcement.createdAt >= :periodStart AND announcement.createdAt < :periodEnd',
      expect.objectContaining({ periodStart: expect.any(Date), periodEnd: expect.any(Date) }),
    );
  });

  it('uses Monday as the start of the selected week', async () => {
    await service.getStatistics('week');

    const periodRange = accountQuery.andWhere.mock.calls.find(
      ([query]) => query === 'company.createdAt >= :periodStart AND company.createdAt < :periodEnd',
    )?.[1] as { periodStart: Date; periodEnd: Date } | undefined;

    expect(periodRange).toBeDefined();
    if (!periodRange) throw new Error('La plage hebdomadaire est absente.');
    expect(periodRange.periodStart.getUTCDay()).toBe(1);
    expect(
      periodRange.periodEnd.getTime() - periodRange.periodStart.getTime(),
    ).toBe(
      7 * 24 * 60 * 60 * 1000,
    );
  });

  it('lists accepted contracts with company names and date-based partnership state', async () => {
    contractRepository.createQueryBuilder.mockReset();
    contractRepository.createQueryBuilder.mockReturnValue(contractListQuery);
    const contracts = await service.getContracts();

    expect(contracts).toHaveLength(1);
    expect(contracts[0]).toMatchObject({
      reference: 'CCI-2026-ABC12345',
      senderCompanyName: 'Entreprise A',
      receiverCompanyName: 'Entreprise B',
      senderLogoUrl: 'https://example.com/sender-logo.png',
      receiverCompanyLogoUrl: 'https://example.com/receiver-saved.png',
      status: 'IN_PROGRESS',
    });
    expect(contractListQuery.where).toHaveBeenCalledWith(
      'contract.status = :status',
      { status: 'ACCEPTED' },
    );
    expect(contractListQuery.addSelect).toHaveBeenCalledWith(
      expect.stringContaining('contract.endDate >= CURRENT_DATE'),
      'status',
    );
  });

  it('returns pending registrations and partnership announcements as notifications', async () => {
    companyRepository.createQueryBuilder.mockReset();
    companyRepository.createQueryBuilder.mockReturnValue(pendingCompaniesQuery);
    pendingCompaniesQuery.getRawMany.mockResolvedValue([
      {
        id: 'company-1',
        companyName: 'Entreprise inscrite',
        createdAt: new Date('2026-10-20T10:00:00.000Z'),
      },
    ]);
    announcementRepository.createQueryBuilder.mockReturnValue(
      partnershipAnnouncementsQuery,
    );
    partnershipAnnouncementsQuery.getRawMany.mockResolvedValue([
      {
        id: 'announcement-1',
        subject: 'Recherche de distributeur',
        companyName: 'Entreprise partenaire',
        createdAt: new Date('2026-10-20T11:00:00.000Z'),
      },
    ]);

    const notifications = await service.getNotifications();

    expect(notifications).toEqual([
      {
        id: 'partnership:announcement-1',
        type: 'PARTNERSHIP',
        companyName: 'Entreprise partenaire',
        subject: 'Recherche de distributeur',
        createdAt: new Date('2026-10-20T11:00:00.000Z'),
      },
      {
        id: 'registration:company-1',
        type: 'REGISTRATION',
        companyName: 'Entreprise inscrite',
        subject: null,
        createdAt: new Date('2026-10-20T10:00:00.000Z'),
      },
    ]);
    expect(pendingCompaniesQuery.where).toHaveBeenCalledWith(
      'company.verificationStatus = :status',
      { status: 'PENDING' },
    );
    expect(partnershipAnnouncementsQuery.where).toHaveBeenCalledWith(
      'LOWER(announcement.category) IN (:...categories)',
      { categories: ['partenariat', 'partenariat commercial'] },
    );
  });
});

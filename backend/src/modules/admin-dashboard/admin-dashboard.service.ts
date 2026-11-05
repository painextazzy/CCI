import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Announcement,
  AnnouncementStatus,
} from '../announcements/entities/announcement.entity';
import { DISCUSSION_STATUS_SELECT } from '../announcements/announcements.service';
import {
  Company,
  CompanyType,
  VerificationStatus,
} from '../companies/entities/company.entity';
import { Contract, ContractStatus } from '../messages/entities/contract.entity';
import { UserRole } from '../users/entities/user.entity';
import { SiteVisit } from './entities/site-visit.entity';

export interface AdminDashboardStatistics {
  accounts: {
    local: number;
    external: number;
    total: number;
  };
  siteVisits: number;
  pendingRequests: number;
  contractsInProgress: number;
  announcements: {
    active: number;
    inProgress: number;
    closed: number;
    total: number;
  };
  economicEvolution: {
    month: string;
    amount: string;
  }[];
}

export type DashboardPeriod = 'day' | 'week' | 'month';

function getPeriodRange(period: DashboardPeriod, now: Date) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  if (period === 'week') {
    const daysSinceMonday = (start.getUTCDay() + 6) % 7;
    start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  } else if (period === 'month') {
    start.setUTCDate(1);
  }

  const end = new Date(start);
  if (period === 'day') {
    end.setUTCDate(end.getUTCDate() + 1);
  } else if (period === 'week') {
    end.setUTCDate(end.getUTCDate() + 7);
  } else {
    end.setUTCMonth(end.getUTCMonth() + 1);
  }

  return { start, end };
}

export interface AdminContractRecord {
  id: string;
  reference: string;
  senderCompanyName: string;
  receiverCompanyName: string;
  title: string;
  description: string;
  amount: string;
  startDate: string;
  endDate: string;
  senderCompanyLogoUrl: string | null;
  senderLogoUrl: string | null;
  senderAvatarUrl: string | null;
  receiverCompanyLogoUrl: string | null;
  receiverLogoUrl: string | null;
  receiverAvatarUrl: string | null;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface AdminNotificationRecord {
  id: string;
  type: 'REGISTRATION' | 'PARTNERSHIP';
  companyName: string;
  subject: string | null;
  createdAt: Date;
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(SiteVisit)
    private readonly siteVisitRepository: Repository<SiteVisit>,
  ) {}

  async getAllAnnouncements(): Promise<Announcement[]> {
    const { entities, raw } = await this.announcementRepository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.company', 'company')
      .leftJoin('company.user', 'companyUser')
      .addSelect('companyUser.avatarUrl')
      .addSelect(DISCUSSION_STATUS_SELECT, 'discussion_status')
      .setParameters({
        closedStatus: AnnouncementStatus.CLOSED,
        inProgressStatus: AnnouncementStatus.IN_PROGRESS,
      })
      .orderBy('announcement.createdAt', 'DESC')
      .getRawAndEntities();

    return entities.map((announcement, index) => {
      announcement.status =
        (raw[index]?.discussion_status as AnnouncementStatus | undefined) ??
        announcement.status;
      return announcement;
    });
  }

  async getStatistics(
    period: DashboardPeriod = 'month',
  ): Promise<AdminDashboardStatistics> {
    const now = new Date();
    const { start, end } = getPeriodRange(period, now);
    const firstMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
    );
    const nextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const [
      accountRows,
      siteVisits,
      pendingRequests,
      contractsInProgress,
      economicRows,
      announcementRows,
    ] = await Promise.all([
      this.companyRepository
        .createQueryBuilder('company')
        .innerJoin('company.user', 'user')
        .select('company.companyType', 'companyType')
        .addSelect('COUNT(user.id)', 'count')
        .where('user.role = :role', { role: UserRole.COMPANY })
        .andWhere('company.companyType != :internationalType', {
          internationalType: CompanyType.INTERNATIONAL,
        })
        .andWhere('company.createdAt >= :periodStart AND company.createdAt < :periodEnd', {
          periodStart: start,
          periodEnd: end,
        })
        .groupBy('company.companyType')
        .getRawMany<{ companyType: CompanyType; count: string }>(),
      this.siteVisitRepository
        .createQueryBuilder('siteVisit')
        .where('siteVisit.visitedAt >= :periodStart AND siteVisit.visitedAt < :periodEnd', {
          periodStart: start,
          periodEnd: end,
        })
        .getCount(),
      this.companyRepository
        .createQueryBuilder('company')
        .where('company.verificationStatus = :status', {
          status: VerificationStatus.PENDING,
        })
        .andWhere('company.createdAt >= :periodStart AND company.createdAt < :periodEnd', {
          periodStart: start,
          periodEnd: end,
        })
        .getCount(),
      this.contractRepository
        .createQueryBuilder('contract')
        .where('contract.status = :status', {
          status: ContractStatus.ACCEPTED,
        })
        .andWhere('contract.startDate <= CURRENT_DATE')
        .andWhere('contract.endDate >= CURRENT_DATE')
        .getCount(),
      this.contractRepository
        .createQueryBuilder('contract')
        .select("TO_CHAR(contract.acceptedAt, 'YYYY-MM')", 'month')
        .addSelect('SUM(contract.amount)', 'amount')
        .where('contract.acceptedAt >= :firstMonth', { firstMonth })
        .andWhere('contract.acceptedAt < :nextMonth', { nextMonth })
        .groupBy("TO_CHAR(contract.acceptedAt, 'YYYY-MM')")
        .orderBy('month', 'ASC')
        .getRawMany<{ month: string; amount: string }>(),
      this.announcementRepository
        .createQueryBuilder('announcement')
        .select(DISCUSSION_STATUS_SELECT, 'status')
        .addSelect('COUNT(announcement.id)', 'count')
        .where('announcement.createdAt >= :periodStart AND announcement.createdAt < :periodEnd', {
          periodStart: start,
          periodEnd: end,
        })
        .setParameters({
          closedStatus: AnnouncementStatus.CLOSED,
          inProgressStatus: AnnouncementStatus.IN_PROGRESS,
        })
        .groupBy(DISCUSSION_STATUS_SELECT)
        .getRawMany<{ status: AnnouncementStatus; count: string }>(),
    ]);

    const companyCounts = new Map(
      accountRows.map(({ companyType, count }) => [
        companyType,
        Number(count),
      ]),
    );
    const local = companyCounts.get(CompanyType.HAUTE_MATSIATRA) ?? 0;
    const external = companyCounts.get(CompanyType.OTHER_REGION) ?? 0;

    const announcementCounts = new Map(
      announcementRows.map(({ status, count }) => [status, Number(count)]),
    );
    const active = announcementCounts.get(AnnouncementStatus.OPEN) ?? 0;
    const inProgress =
      announcementCounts.get(AnnouncementStatus.IN_PROGRESS) ?? 0;
    const closed = announcementCounts.get(AnnouncementStatus.CLOSED) ?? 0;

    const amountsByMonth = new Map(
      economicRows.map(({ month, amount }) => [month, amount]),
    );
    const economicEvolution = Array.from({ length: 6 }, (_, index) => {
      const month = new Date(
        Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + index, 1),
      )
        .toISOString()
        .slice(0, 7);
      return { month, amount: amountsByMonth.get(month) ?? '0' };
    });

    return {
      accounts: { local, external, total: local + external },
      siteVisits,
      pendingRequests,
      contractsInProgress,
      announcements: {
        active,
        inProgress,
        closed,
        total: active + inProgress + closed,
      },
      economicEvolution,
    };
  }

  async getContracts(): Promise<AdminContractRecord[]> {
    return this.contractRepository
      .createQueryBuilder('contract')
      .select('contract.id', 'id')
      .addSelect('contract.reference', 'reference')
      .addSelect('contract.senderCompanyName', 'senderCompanyName')
      .addSelect('contract.receiverCompanyName', 'receiverCompanyName')
      .addSelect('contract.title', 'title')
      .addSelect('contract.description', 'description')
      .addSelect('contract.amount', 'amount')
      .addSelect('contract.startDate', 'startDate')
      .addSelect('contract.endDate', 'endDate')
      .addSelect('contract.senderCompanyLogoUrl', 'senderCompanyLogoUrl')
      .addSelect('senderCompany.logoUrl', 'senderLogoUrl')
      .addSelect('senderUser.avatarUrl', 'senderAvatarUrl')
      .addSelect('contract.receiverCompanyLogoUrl', 'receiverCompanyLogoUrl')
      .addSelect('receiverCompany.logoUrl', 'receiverLogoUrl')
      .addSelect('receiverUser.avatarUrl', 'receiverAvatarUrl')
      .addSelect(
        `CASE
          WHEN contract.startDate > CURRENT_DATE THEN 'UPCOMING'
          WHEN contract.endDate >= CURRENT_DATE THEN 'IN_PROGRESS'
          ELSE 'COMPLETED'
        END`,
        'status',
      )
      .leftJoin('contract.senderCompany', 'senderCompany')
      .leftJoin('senderCompany.user', 'senderUser')
      .leftJoin('contract.receiverCompany', 'receiverCompany')
      .leftJoin('receiverCompany.user', 'receiverUser')
      .where('contract.status = :status', {
        status: ContractStatus.ACCEPTED,
      })
      .orderBy('contract.acceptedAt', 'DESC')
      .getRawMany<AdminContractRecord>();
  }

  async getNotifications(): Promise<AdminNotificationRecord[]> {
    const [pendingCompanies, partnershipAnnouncements] = await Promise.all([
      this.companyRepository
        .createQueryBuilder('company')
        .select('company.id', 'id')
        .addSelect('company.companyName', 'companyName')
        .addSelect('company.createdAt', 'createdAt')
        .where('company.verificationStatus = :status', {
          status: VerificationStatus.PENDING,
        })
        .orderBy('company.createdAt', 'DESC')
        .take(10)
        .getRawMany<{
          id: string;
          companyName: string;
          createdAt: Date;
        }>(),
      this.announcementRepository
        .createQueryBuilder('announcement')
        .select('announcement.id', 'id')
        .addSelect('announcement.title', 'subject')
        .addSelect('announcement.createdAt', 'createdAt')
        .addSelect('company.companyName', 'companyName')
        .leftJoin('announcement.company', 'company')
        .where('LOWER(announcement.category) IN (:...categories)', {
          categories: ['partenariat', 'partenariat commercial'],
        })
        .orderBy('announcement.createdAt', 'DESC')
        .take(10)
        .getRawMany<{
          id: string;
          subject: string;
          companyName: string;
          createdAt: Date;
        }>(),
    ]);

    return [
      ...pendingCompanies.map(
        (company): AdminNotificationRecord => ({
          id: `registration:${company.id}`,
          type: 'REGISTRATION',
          companyName: company.companyName,
          subject: null,
          createdAt: company.createdAt,
        }),
      ),
      ...partnershipAnnouncements.map(
        (announcement): AdminNotificationRecord => ({
          id: `partnership:${announcement.id}`,
          type: 'PARTNERSHIP',
          companyName: announcement.companyName,
          subject: announcement.subject,
          createdAt: announcement.createdAt,
        }),
      ),
    ]
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      )
      .slice(0, 20);
  }
}

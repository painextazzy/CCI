import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Announcement,
  AnnouncementStatus,
} from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { Company } from '../companies/entities/company.entity';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

export const DISCUSSION_STATUS_SELECT = `CASE
  WHEN announcement.status <> :closedStatus
    AND EXISTS (
      SELECT 1
      FROM interests discussion_interest
      INNER JOIN messages discussion_message
        ON discussion_message.interest_id = discussion_interest.id
      WHERE discussion_interest.announcement_id = announcement.id
        AND discussion_message."isSystemNotification" = false
    )
  THEN :inProgressStatus
  ELSE announcement.status
END`;

const HAS_ACCEPTED_CONTRACT_SELECT = `EXISTS (
  SELECT 1
  FROM contracts accepted_contract
  INNER JOIN messages proposal_message
    ON proposal_message.id = accepted_contract.proposal_message_id
  INNER JOIN interests proposal_interest
    ON proposal_interest.id = proposal_message.interest_id
  WHERE proposal_interest.announcement_id = announcement.id
)`;

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async create(
    createDto: CreateAnnouncementDto,
    company: Company,
  ): Promise<Announcement> {
    const announcement = this.announcementRepository.create({
      ...createDto,
      company: company, // 👈 Remplit automatiquement la clé étrangère company_id
    });

    return await this.announcementRepository.save(announcement);
  }

  async findAll(): Promise<Announcement[]> {
    const { entities, raw } = await this.announcementRepository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.company', 'company')
      .leftJoin('company.user', 'companyUser')
      .addSelect('companyUser.avatarUrl')
      .addSelect(DISCUSSION_STATUS_SELECT, 'discussion_status')
      .addSelect(HAS_ACCEPTED_CONTRACT_SELECT, 'is_contracted')
      .setParameters({
        closedStatus: AnnouncementStatus.CLOSED,
        inProgressStatus: AnnouncementStatus.IN_PROGRESS,
      })
      .orderBy('announcement.createdAt', 'DESC')
      .getRawAndEntities();

    return this.applyDiscussionStatuses(entities, raw);
  }

  async findMine(companyId: string): Promise<Announcement[]> {
    const { entities, raw } = await this.announcementRepository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.company', 'company')
      .addSelect(DISCUSSION_STATUS_SELECT, 'discussion_status')
      .where('company.id = :companyId', { companyId })
      .setParameters({
        closedStatus: AnnouncementStatus.CLOSED,
        inProgressStatus: AnnouncementStatus.IN_PROGRESS,
      })
      .orderBy('announcement.createdAt', 'DESC')
      .getRawAndEntities();

    return this.applyDiscussionStatuses(entities, raw);
  }

  async updateMine(
    id: string,
    companyId: string,
    updateDto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    const announcement = await this.findOwnedAnnouncement(id, companyId);
    Object.assign(announcement, updateDto);
    return this.announcementRepository.save(announcement);
  }

  async removeMine(id: string, companyId: string): Promise<void> {
    const announcement = await this.findOwnedAnnouncement(id, companyId);
    await this.announcementRepository.remove(announcement);
  }

  private async findOwnedAnnouncement(
    id: string,
    companyId: string,
  ): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id, company: { id: companyId } },
    });
    if (!announcement) {
      throw new NotFoundException('Annonce introuvable.');
    }
    return announcement;
  }

  private applyDiscussionStatuses(
    entities: Announcement[],
    raw: Record<string, unknown>[],
  ): Announcement[] {
    return entities.map((announcement, index) => {
      announcement.status =
        (raw[index]?.discussion_status as AnnouncementStatus | undefined) ??
        announcement.status;
      if (raw[index]?.is_contracted !== undefined) {
        announcement.isContracted = raw[index].is_contracted === true;
      }
      return announcement;
    });
  }
}

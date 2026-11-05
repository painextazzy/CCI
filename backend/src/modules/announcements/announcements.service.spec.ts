import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './entities/announcement.entity';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    leftJoin: jest.Mock;
    addSelect: jest.Mock;
    where: jest.Mock;
    setParameters: jest.Mock;
    orderBy: jest.Mock;
    getRawAndEntities: jest.Mock;
  };
  let announcementRepository: {
    createQueryBuilder: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn().mockResolvedValue({ entities: [], raw: [] }),
    };
    announcementRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        {
          provide: getRepositoryToken(Announcement),
          useValue: announcementRepository,
        },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists contracted announcements and marks active discussions in progress', async () => {
    const openAnnouncement = {
      id: 'announcement-1',
      status: 'OPEN',
    } as Announcement;
    const closedAnnouncement = {
      id: 'announcement-2',
      status: 'CLOSED',
    } as Announcement;
    queryBuilder.getRawAndEntities.mockResolvedValue({
      entities: [openAnnouncement, closedAnnouncement],
      raw: [
        { discussion_status: 'IN_PROGRESS', is_contracted: true },
        { discussion_status: 'CLOSED', is_contracted: false },
      ],
    });

    const announcements = await service.findAll();

    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      expect.stringContaining('FROM contracts accepted_contract'),
      'is_contracted',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      expect.stringContaining('INNER JOIN messages discussion_message'),
      'discussion_status',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      expect.stringContaining(
        'discussion_message."isSystemNotification" = false',
      ),
      'discussion_status',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      expect.not.stringContaining('Proposition de contrat'),
      'discussion_status',
    );
    expect(announcements.map(({ id, status }) => ({ id, status }))).toEqual([
      { id: 'announcement-1', status: 'IN_PROGRESS' },
      { id: 'announcement-2', status: 'CLOSED' },
    ]);
    expect(announcements[0].isContracted).toBe(true);
    expect(announcements[1].isContracted).toBe(false);
  });

  it('lists owned announcements with discussion status applied', async () => {
    const announcement = {
      id: 'announcement-1',
      status: 'OPEN',
    } as Announcement;
    queryBuilder.getRawAndEntities.mockResolvedValue({
      entities: [announcement],
      raw: [{ discussion_status: 'IN_PROGRESS' }],
    });

    const announcements = await service.findMine('company-1');

    expect(queryBuilder.where).toHaveBeenCalledWith('company.id = :companyId', {
      companyId: 'company-1',
    });
    expect(announcements[0].status).toBe('IN_PROGRESS');
  });

  it('updates an announcement only after finding it under the owning company', async () => {
    const announcement = { id: 'announcement-1', title: 'Before' };
    announcementRepository.findOne.mockResolvedValue(announcement);
    announcementRepository.save.mockImplementation((value) => value);

    const updated = await service.updateMine('announcement-1', 'company-1', {
      title: 'After',
    });

    expect(announcementRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'announcement-1', company: { id: 'company-1' } },
    });
    expect(updated.title).toBe('After');
    expect(announcementRepository.save).toHaveBeenCalledWith(announcement);
  });

  it('does not update an announcement owned by another company', async () => {
    announcementRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateMine('announcement-1', 'company-1', { title: 'After' }),
    ).rejects.toThrow('Annonce introuvable.');
    expect(announcementRepository.save).not.toHaveBeenCalled();
  });

  it('does not remove an announcement owned by another company', async () => {
    announcementRepository.findOne.mockResolvedValue(null);

    await expect(
      service.removeMine('announcement-1', 'company-1'),
    ).rejects.toThrow('Annonce introuvable.');
    expect(announcementRepository.remove).not.toHaveBeenCalled();
  });
});

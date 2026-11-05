import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  let announcementsService: Pick<AnnouncementsService, 'findAll'>;

  beforeEach(async () => {
    announcementsService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        {
          provide: AnnouncementsService,
          useValue: announcementsService,
        },
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns all announcements', async () => {
    const announcements = [
      { id: 'announcement-1' },
    ] as Awaited<ReturnType<AnnouncementsService['findAll']>>;
    jest
      .spyOn(announcementsService, 'findAll')
      .mockResolvedValue(announcements);

    await expect(controller.findAll()).resolves.toBe(announcements);
    expect(announcementsService.findAll).toHaveBeenCalledTimes(1);
  });
});

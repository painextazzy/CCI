import { validate } from 'class-validator';
import { CreateAnnouncementDto } from './create-announcement.dto';

describe('CreateAnnouncementDto', () => {
  const createDto = (deadline: string) =>
    Object.assign(new CreateAnnouncementDto(), {
      type: 'OFFRE',
      title: 'Annonce',
      category: 'Sous-traitance',
      description: 'Description',
      deadline,
    });

  it('rejects a deadline that is today', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const errors = await validate(createDto(`${today}T23:59:59.000Z`));

    expect(errors.map((error) => error.property)).toContain('deadline');
  });

  it('accepts a deadline after today', async () => {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const deadline = `${tomorrow.toISOString().slice(0, 10)}T23:59:59.000Z`;

    await expect(validate(createDto(deadline))).resolves.toHaveLength(0);
  });
});

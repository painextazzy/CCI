import { validate } from 'class-validator';
import { RegisterCompanyDto } from './register-company.dto';

describe('RegisterCompanyDto phone validation', () => {
  const createDto = (phone: string) =>
    Object.assign(new RegisterCompanyDto(), { phone });

  it('accepts a 10-digit local number starting with 03', async () => {
    const errors = await validate(createDto('0341234567'));

    expect(errors.some((error) => error.property === 'phone')).toBe(false);
  });

  it('rejects local numbers starting with 03 that are not exactly 10 digits', async () => {
    for (const phone of ['034123456', '03412345678']) {
      const errors = await validate(createDto(phone));
      expect(errors.some((error) => error.property === 'phone')).toBe(true);
    }
  });

  it('continues to accept international numbers', async () => {
    const errors = await validate(createDto('+261341234567'));

    expect(errors.some((error) => error.property === 'phone')).toBe(false);
  });
});

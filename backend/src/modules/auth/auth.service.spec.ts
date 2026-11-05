import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailService } from '../../mail/email.service';

describe('AuthService', () => {
  let service: AuthService;
  const userRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const cloudinaryService = {
    uploadFile: jest.fn(),
  };
  const mailService = {
    sendPasswordResetOtp: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Company), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: CloudinaryService, useValue: cloudinaryService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('saves the uploaded profile photo as the company logo as well', async () => {
    const photoUrl = 'https://res.cloudinary.com/example/company-photo.jpg';
    const user = {
      id: 'user-id',
      avatarUrl: null,
      company: { id: 'company-id', logoUrl: null },
    };
    userRepository.findOne.mockResolvedValue(user);
    cloudinaryService.uploadFile.mockResolvedValue({ secure_url: photoUrl });
    userRepository.save.mockResolvedValue(user);

    await expect(
      service.updateProfilePhoto('user-id', {
        buffer: Buffer.from('image'),
      } as Express.Multer.File),
    ).resolves.toEqual({ avatarUrl: photoUrl });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      relations: { company: true },
    });
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarUrl: photoUrl,
        company: expect.objectContaining({ logoUrl: photoUrl }),
      }),
    );
  });

  it('sends a six-digit reset code without storing it in plain text', async () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    userRepository.findOne.mockResolvedValue(user);
    userRepository.save.mockResolvedValue(user);
    mailService.sendPasswordResetOtp.mockResolvedValue(undefined);

    await expect(
      service.requestPasswordReset({ email: user.email }),
    ).resolves.toHaveProperty('message');

    const sentCode = mailService.sendPasswordResetOtp.mock.calls[0][1] as string;
    expect(sentCode).toMatch(/^\d{6}$/);
    const savedUser = userRepository.save.mock.calls[0][0] as User;
    expect(savedUser.passwordResetOtpHash).not.toBe(sentCode);
    await expect(bcrypt.compare(sentCode, savedUser.passwordResetOtpHash!)).resolves.toBe(true);
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  it('returns the same response when the email is not registered', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.requestPasswordReset({ email: 'unknown@example.com' }),
    ).resolves.toHaveProperty('message');

    expect(mailService.sendPasswordResetOtp).not.toHaveBeenCalled();
  });

  it('resets the password and invalidates the code after successful confirmation', async () => {
    const otpHash = await bcrypt.hash('123456', 10);
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      password: 'old-password-hash',
      passwordResetOtpHash: otpHash,
      passwordResetOtpExpiresAt: new Date(Date.now() + 60_000),
    };
    userRepository.findOne.mockResolvedValue(user);
    userRepository.save.mockResolvedValue(user);

    await expect(
      service.resetPassword({
        email: user.email,
        code: '123456',
        newPassword: 'new-password',
      }),
    ).resolves.toEqual({ message: 'Votre mot de passe a été réinitialisé.' });

    expect(user.password).not.toBe('old-password-hash');
    expect(user.passwordResetOtpHash).toBeNull();
    expect(user.passwordResetOtpExpiresAt).toBeNull();
  });

  it('rejects an incorrect reset code', async () => {
    const otpHash = await bcrypt.hash('123456', 10);
    userRepository.findOne.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      passwordResetOtpHash: otpHash,
      passwordResetOtpExpiresAt: new Date(Date.now() + 60_000),
    });

    await expect(
      service.resetPassword({
        email: 'user@example.com',
        code: '654321',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an expired reset code', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      passwordResetOtpHash: await bcrypt.hash('123456', 10),
      passwordResetOtpExpiresAt: new Date(Date.now() - 1),
    });

    await expect(
      service.resetPassword({
        email: 'user@example.com',
        code: '123456',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
    registerCompany: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the JWT in the login response and clears any legacy auth cookie', async () => {
    const user = { id: 'user-id', email: 'user@example.com', role: 'COMPANY' };
    authService.login.mockResolvedValue({
      accessToken: 'signed-jwt',
      user,
    });
    const clearCookie = jest.fn();
    const response = { clearCookie } as unknown as Response;

    await expect(
      controller.login(
        { email: 'user@example.com', password: 'password' },
        response,
      ),
    ).resolves.toEqual({ accessToken: 'signed-jwt', user });

    expect(clearCookie).toHaveBeenCalledWith(
      'cci_b2b_token',
      expect.objectContaining({ path: '/' }),
    );
    expect(clearCookie).toHaveBeenCalledTimes(1);
  });

  it('clears the previous cross-site cookie on login when running on Render', async () => {
    const originalRenderServiceId = process.env.RENDER_SERVICE_ID;
    process.env.RENDER_SERVICE_ID = 'srv-test';
    authService.login.mockResolvedValue({
      accessToken: 'signed-jwt',
      user: { id: 'user-id', email: 'user@example.com', role: 'COMPANY' },
    });
    const clearCookie = jest.fn();
    const response = { clearCookie } as unknown as Response;

    try {
      await controller.login(
        { email: 'user@example.com', password: 'password' },
        response,
      );
      expect(clearCookie).toHaveBeenCalledWith(
        'cci_b2b_token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        }),
      );
      expect(clearCookie).toHaveBeenCalledWith(
        'cci_b2b_token',
        expect.objectContaining({ partitioned: true }),
      );
      expect(clearCookie).toHaveBeenCalledTimes(2);
    } finally {
      if (originalRenderServiceId === undefined) {
        delete process.env.RENDER_SERVICE_ID;
      } else {
        process.env.RENDER_SERVICE_ID = originalRenderServiceId;
      }
    }
  });

  it('clears the authentication cookie on logout', () => {
    const clearCookie = jest.fn();
    const response = { clearCookie } as unknown as Response;

    expect(controller.logout(response)).toEqual({
      message: 'Déconnexion réussie',
    });
    expect(clearCookie).toHaveBeenCalledWith(
      'cci_b2b_token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });
});

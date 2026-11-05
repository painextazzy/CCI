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

  it('stores the JWT in an HttpOnly cookie and omits it from the response body', async () => {
    const user = { id: 'user-id', email: 'user@example.com', role: 'COMPANY' };
    authService.login.mockResolvedValue({
      accessToken: 'signed-jwt',
      user,
    });
    const setCookie = jest.fn();
    const response = { cookie: setCookie } as unknown as Response;

    await expect(
      controller.login(
        { email: 'user@example.com', password: 'password' },
        response,
      ),
    ).resolves.toEqual({ user });

    expect(setCookie).toHaveBeenCalledWith(
      'cci_b2b_token',
      'signed-jwt',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });

  it('sets a secure partitioned cookie when running on Render', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalRender = process.env.RENDER;
    const originalRenderServiceId = process.env.RENDER_SERVICE_ID;
    process.env.NODE_ENV = 'test';
    process.env.RENDER = 'true';
    delete process.env.RENDER_SERVICE_ID;

    try {
      authService.login.mockResolvedValue({
        accessToken: 'signed-jwt',
        user: { id: 'user-id', email: 'user@example.com', role: 'COMPANY' },
      });
      const setCookie = jest.fn();
      const response = { cookie: setCookie } as unknown as Response;

      await controller.login(
        { email: 'user@example.com', password: 'password' },
        response,
      );

      expect(setCookie).toHaveBeenCalledWith(
        'cci_b2b_token',
        'signed-jwt',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          partitioned: true,
          path: '/',
        }),
      );
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalRender === undefined) delete process.env.RENDER;
      else process.env.RENDER = originalRender;
      if (originalRenderServiceId === undefined)
        delete process.env.RENDER_SERVICE_ID;
      else process.env.RENDER_SERVICE_ID = originalRenderServiceId;
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

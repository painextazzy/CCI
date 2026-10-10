import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { CompanyRegistrationFiles } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';

const AUTH_COOKIE_NAME = 'cci_b2b_token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, ...result } = await this.authService.login(loginDto);
    response.cookie(AUTH_COOKIE_NAME, accessToken, this.getCookieOptions());
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, this.getCookieOptions());
    return { message: 'Déconnexion réussie' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Req() request: Request & { user: Record<string, unknown> }) {
    const { password: _password, ...user } = request.user;
    return user;
  }

  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'kbisFile', maxCount: 1 },
      { name: 'logoFile', maxCount: 1 },
    ]),
  )
  async register(
    @Body() body: RegisterCompanyDto,
    @UploadedFiles() files: CompanyRegistrationFiles,
  ) {
    return this.authService.registerCompany(body, files);
  }

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }
}
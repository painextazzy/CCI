import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { CompanyRegistrationFiles } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @Req() request: Request & { user: { id: string } },
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(request.user.id, body);
  }

  @Post('forgot-password')
  requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(body);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile-photo')
  @UseInterceptors(
    FileInterceptor('photo', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  updateProfilePhoto(
    @Req() request: Request & { user: { id: string } },
    @UploadedFile() photo: Express.Multer.File | undefined,
  ) {
    if (!photo || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(photo.mimetype)) {
      throw new BadRequestException('Veuillez sélectionner une image JPEG, PNG, WebP ou GIF.');
    }
    return this.authService.updateProfilePhoto(request.user.id, photo);
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
    const isProduction =
      process.env.NODE_ENV === 'production' ||
      process.env.RENDER === 'true' ||
      Boolean(process.env.RENDER_SERVICE_ID);
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      ...(isProduction ? { partitioned: true } : {}),
      path: '/',
    };
  }
}
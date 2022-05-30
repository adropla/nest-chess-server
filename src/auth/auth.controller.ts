import { RefreshTokenGuard } from './../common/guards/';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthUserDto } from 'src/auth/dto/auth-user.dto';
import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from 'src/common/decorators';
import { Response } from 'express';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() userDto: AuthUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(userDto);
    const decodedRefreshToken = this.authService.getDecodedToken(
      tokens.refreshToken,
    );
    if (tokens.refreshToken) {
      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        expires: new Date(decodedRefreshToken.exp * 1000),
      });
    }
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('registration')
  async registration(
    @Body() userDto: AuthUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.registration(userDto);
    const decodedRefreshToken = this.authService.getDecodedToken(
      tokens.refreshToken,
    );
    if (tokens.refreshToken) {
      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        expires: new Date(decodedRefreshToken.exp * 1000),
      });
    }
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('refreshToken', { httpOnly: true }); // DO SECURE FOR PRODUCTION HTTPS
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}

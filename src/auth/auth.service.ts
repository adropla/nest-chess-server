import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { AuthUserDto } from './dto';
import {
  ACCESS_TOKEN_EXP_TIME,
  REFRESH_TOKEN_EXP_TIME,
} from '../constants/jwt';
import { UsersService } from 'src/users/users.service';
import { TDecodedToken, TTokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async getTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
        },
        {
          secret:
            process.env.PRIVATE_KEY_ACCESS || 'SECRETACCESSNUMBER1NESTJSAPP',
          expiresIn: ACCESS_TOKEN_EXP_TIME,
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
        },
        {
          secret:
            process.env.PRIVATE_KEY_REFRESH || 'SECRETREFRESHNUMBER1NESTJSAPP',
          expiresIn: REFRESH_TOKEN_EXP_TIME,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async validateUser(userDto: AuthUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Пользователя с таким email не существует',
      });
    }
    const isPasswordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (!isPasswordEquals) {
      throw new UnauthorizedException({
        message: 'Неправильный пароль',
      });
    }

    return user;
  }

  async login(userDto: AuthUserDto): Promise<TTokens> {
    const user = await this.validateUser(userDto);
    const tokens = await this.getTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async registration(userDto: AuthUserDto): Promise<TTokens> {
    const candidate = await this.userService.getUserByEmail(userDto.email);

    if (candidate) {
      throw new HttpException(
        'Пользователь с таким email существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(userDto.password, 10);
    const user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });
    const tokens = await this.getTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshTokenHash(id: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(id, hash);
  }

  async logout(userId: string) {
    await this.userService.setRefreshTokenNull(userId);
  }

  async refreshTokens(id: string, refreshToken: string) {
    const user = await this.userService.getUserById(id);

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const isRefreshTokenEquals = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (user && isRefreshTokenEquals) {
      const tokens = await this.getTokens(user.id);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
      return tokens;
    }
    throw new ForbiddenException('Access Denied');
  }

  getDecodedToken(jwt: any) {
    const decodedJwt = this.jwtService.decode(jwt) as TDecodedToken;
    return decodedJwt;
  }
}

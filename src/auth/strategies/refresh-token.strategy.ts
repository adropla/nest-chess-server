import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.validate,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey:
        process.env.PRIVATE_KEY_REFRESH || 'SECRETREFRESHNUMBER1NESTJSAPP',
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  private static validate(req: Request) {
    const refreshToken = req.headers['cookie'].slice(13);
    console.log(refreshToken);
    return refreshToken ? refreshToken : null;
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenPayload } from '../../internalTypes/Auth/authToken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('refreshSign'),
      passReqToCallback: true,
    });
  }

  /**
   * This method is used for validate refresh token
   * @param req -- express req object
   * @param payload -- decrypted Refresh token payload
   */
  validate(req: Request, payload: RefreshTokenPayload) {
    const refreshToken = req.headers['authorization']
      .replace('Bearer', '')
      .trim();
    return { ...payload, refreshToken };
  }
}

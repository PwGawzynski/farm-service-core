import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthTokenPayload } from '../../internalTypes/Auth/authToken';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';

/**
 * This cals is used for implement passport JWT strategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('secretSign'),
    });
  }

  /**
   * This method is in charge of validate access token, checks its expiration date, validate signature and assign user Object to req
   * @param payload decrypted Access token payload
   * @param done fn. called when validation done
   * @throws UnauthorizedException if token is not validate
   */
  async validate(payload: AuthTokenPayload, done: (error, user) => void) {
    console.log(payload);
    if (!payload || !payload.userId) done(new UnauthorizedException(), false);
    const user = User.findOne({
      where: {
        id: payload.userId,
      },
    });
    if (!user) {
      console.warn('CAUSER DONT EXIST IN DB');
      return done(new UnauthorizedException(), false);
    }
    return done(null, user);
  }
}

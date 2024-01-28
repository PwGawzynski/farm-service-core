import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDataDto } from './dto/user-data.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { v4 as uuid } from 'uuid';
import {
  AuthToken,
  AuthTokenPayload,
  RefreshTokenPayload,
} from '../../internalTypes/Auth/authToken';
import { RefreshToken } from './entities/accessToken.entity';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  /**
   * Used to validate given login & password with stored in db user data
   * @param userData DTO object specified by UserDataDto interface
   * @return User Entity Object if credentials are correct
   * @throws error if not
   */
  async checkUserCredentials(userData: UserDataDto): Promise<User> {
    const user = await this.userService.findOne(userData.email);
    if (!user) throw new HttpException('Unauthorised', HttpStatus.UNAUTHORIZED);
    const credentials = await user.account;
    return bcrypt
      .compare(userData.password, credentials.password)
      .then((result) => {
        if (result) return user;
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      })
      .catch((e) => {
        throw e;
      });
  }

  /**
   * This method is used to clear all expired  refresh tokens from db, this action must be done to prevent db from overload by old expired refresh tokens
   * @param tokens Array of AccessToken Entity objects
   * @return void
   * @throws Error if violated max number of logged devices
   */
  async remOldRefreshTokens(tokens: Array<RefreshToken>): Promise<void> {
    const toRemove = tokens.filter((token) => {
      return (
        new Date().getTime() - token.createdAt.getTime() >
        parseInt(
          this.configService.get<string>('refreshTokenExpirationTime') ||
            '21600000',
        )
      );
    });
    toRemove.forEach((token) => token.remove());
    if (
      tokens.length - toRemove.length >
      parseInt(
        this.configService.get<string>('maxRegisteredDevicesCount') || '180m',
      )
    )
      throw new HttpException(
        'The maximum numbers of active devices has been Violated',
        HttpStatus.UNAUTHORIZED,
      );
  }

  /**
   * hash any given data
   * @param data data to be hashed
   * @type {(data: string)}
   * @return hashed string
   * @throws INTERNAL_SERVER_ERROR if hash process went wrong
   */
  async hashData(data: string): Promise<string> {
    return bcrypt
      .hash(data, 10)
      .then((hashed) => hashed)
      .catch(() => {
        throw new HttpException(
          'Some went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  /**
   * This method creates Access and Refresh tokens
   * @param userLogin -- user login string
   * @param userId -- UserEntity(db) id
   * @param refreshTokenId -- TokenEntity(db) id
   * @return array of promised access token and refresh token
   */
  async createTokens(
    userLogin: string,
    userId: string,
    refreshTokenId: string,
  ) {
    const payload = {
      userLogin,
      userId,
    } as AuthTokenPayload;
    const refreshPayload = {
      ...payload,
      deviceId: uuid(),
      refreshTokenId,
    } as RefreshTokenPayload;
    //TODO swap to config
    return Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('secretSign'),
        expiresIn: this.configService.get<string>('accessTokenExpirationTime'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('refreshSign'),
        expiresIn: parseInt(
          this.configService.get<string>('refreshTokenExpirationTime') ||
            '21600000',
        ),
      }),
    ]);
  }

  async checkDeviceId(plainDeviceId: string, hashed: string) {
    return bcrypt
      .compare(plainDeviceId, hashed)
      .then((result) => {
        console.log(result, hashed);
        if (result) return hashed;
        return false;
      })
      .catch((e) => {
        throw e;
      });
  }

  /**
   * login operation driver method
   * @param user data given in req specified by UserDataDto object
   * @return response with Access Token and Refresh Token
   * @throws HttpException if operation went wrong
   */
  async login(user: UserDataDto) {
    console.log(user);
    const validUser = await this.checkUserCredentials(user);
    const account = await validUser.account;
    const accessEntity = new RefreshToken();

    const [accessToken, refreshToken] = await this.createTokens(
      account.email,
      validUser.id,
      accessEntity.id,
    );

    await this.remOldRefreshTokens(await validUser.tokens);
    accessEntity.deviceId = await this.hashData(refreshToken);
    accessEntity.user = Promise.resolve(validUser);
    accessEntity.save();

    return {
      code: ResponseCode.ProcessedCorrect,
      payload: {
        access_token: accessToken,
        refresh_token: refreshToken,
      } as AuthToken,
    } as ResponseObject<AuthToken>;
  }

  /**
   * Method used to refresh access token
   * @param req -- express req object
   * @return response with new access and refresh token
   * @throws HttpException in case operation failure
   */
  async refreshToken(req: Request) {
    if (!req.user)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const validUser = await this.userService.findOneById(req.user['userId']);
    if (!validUser)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const account = await validUser.account;

    const oldTokensEntity = await RefreshToken.find({
      where: {
        user: { id: validUser['userId'] },
      },
    });
    const oldTokenEntity = (
      await Promise.all(
        oldTokensEntity.map((t) =>
          this.checkDeviceId(
            (req.user as Express.User)['refreshToken'],
            t.deviceId,
          ),
        ),
      )
    ).find((result) => typeof result === 'string');

    console.log(oldTokenEntity, 'OTE');
    if (!oldTokenEntity)
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    (
      await RefreshToken.findOne({
        where: {
          deviceId: oldTokenEntity,
        },
      })
    )?.remove();

    const newTokenEntity = new RefreshToken();
    const [accessToken, refreshToken] = await this.createTokens(
      account.email,
      validUser.id,
      newTokenEntity.id,
    );
    newTokenEntity.user = Promise.resolve(validUser);
    newTokenEntity.deviceId = await this.hashData(refreshToken);
    newTokenEntity.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: {
        access_token: accessToken,
        refresh_token: refreshToken,
      } as AuthToken,
    } as ResponseObject<AuthToken>;
  }
}

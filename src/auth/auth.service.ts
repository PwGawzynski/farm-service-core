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
  private static secret: string;
  private static refreshSecret: string;
  private static accessTokenExpirationTime: string;
  private static refreshTokenExpirationTime: string;
  private static maxRegisteredDevicesCount: string;
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {
    const {
      secret,
      refresh,
      accessTokenExpirationTime,
      refreshTokenExpirationTime,
      maxRegisteredDevicesCount,
    } = this.prepareConfig();
    if (!secret) throw new Error('No secret sign');
    AuthService.secret = secret;
    if (!refresh) throw new Error('No refresh sign');
    AuthService.refreshSecret = refresh;
    if (!accessTokenExpirationTime)
      throw new Error('No access token expiration time');
    AuthService.accessTokenExpirationTime = accessTokenExpirationTime;
    if (!refreshTokenExpirationTime)
      throw new Error('No refresh token expiration time');
    AuthService.refreshTokenExpirationTime = refreshTokenExpirationTime;
    if (!maxRegisteredDevicesCount)
      throw new Error('No max registered devices count');
    AuthService.maxRegisteredDevicesCount = maxRegisteredDevicesCount;
  }

  /**
   * This method retrieves configuration values from the environment variables.
   * It fetches the secret sign, refresh sign, access token expiration time, refresh token expiration time, and maximum registered devices count.
   *
   * @returns {Object} An object containing the following properties:
   * - secret: The secret sign used for JWT signing.
   * - refresh: The refresh sign used for JWT signing.
   * - accessTokenExpirationTime: The expiration time for access tokens.
   * - refreshTokenExpirationTime: The expiration time for refresh tokens.
   * - maxRegisteredDevicesCount: The maximum number of devices that can be registered per user.
   */
  private prepareConfig() {
    const secret = this.configService.get<string>('secretSign');
    const refresh = this.configService.get<string>('refreshSign');
    const accessTokenExpirationTime = this.configService.get<string>(
      'accessTokenExpirationTime',
    );
    const refreshTokenExpirationTime = this.configService.get<string>(
      'refreshTokenExpirationTime',
    );
    const maxRegisteredDevicesCount = this.configService.get<string>(
      'maxRegisteredDevicesCount',
    );
    return {
      secret,
      refresh,
      accessTokenExpirationTime,
      refreshTokenExpirationTime,
      maxRegisteredDevicesCount,
    };
  }

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
        parseInt(AuthService.refreshTokenExpirationTime)
      );
    });
    toRemove.forEach((token) => token.remove());
    if (
      tokens.length - toRemove.length >
      parseInt(AuthService.maxRegisteredDevicesCount)
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
   * This method is used to create access and refresh tokens for a user.
   *
   * @param {string} userLogin - The login of the user.
   * @param {string} userId - The ID of the user.
   * @param {string} refreshTokenId - The ID of the refresh token.
   *
   * @returns {Promise<Array>} A promise that resolves to an array containing the following:
   * - The access token.
   * - The refresh token.
   * - The device ID.
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
    return Promise.all([
      this.jwtService.signAsync(payload, {
        secret: AuthService.secret,
        expiresIn: AuthService.accessTokenExpirationTime,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: AuthService.refreshSecret,
        expiresIn: parseInt(AuthService.refreshTokenExpirationTime),
      }),
      refreshPayload.deviceId,
    ]);
  }

  /* async checkDeviceId(plainDeviceId: string, hashed: string) {
    return bcrypt
      .compare(plainDeviceId, hashed)
      .then((result) => {
        //console.log(result, hashed);
        if (result) return hashed;
        return false;
      })
      .catch((e) => {
        throw e;
      });
  }*/

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

    const [accessToken, refreshToken, deviceID] = await this.createTokens(
      account.email,
      validUser.id,
      accessEntity.id,
    );

    await this.remOldRefreshTokens(await validUser.tokens);
    accessEntity.deviceId = deviceID;
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
   * This method validates the request by checking the user and their tokens.
   *
   * @param {Request} req - The request object.
   *
   * @returns {Promise<Object>} A promise that resolves to an object containing the following:
   * - validUser: The validated user.
   * - account: The account of the validated user.
   *
   * @throws {HttpException} If the user is not found, if the user is not authorized, or if the token is invalid.
   */
  async _validateRequest(req: Request) {
    if (!req.user)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const validUser = await this.userService.findOneById(req.user['userId']);
    if (!validUser)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const account = await validUser.account;

    const oldTokensEntity = await RefreshToken.find({
      where: {
        deviceId: req.user['deviceId'],
      },
    });
    if (!oldTokensEntity.length)
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    oldTokensEntity.forEach((token) => token.remove());

    return { validUser, account };
  }

  /**
   * Method used to refresh access token
   * @param req -- express req object
   * @return response with new access and refresh token
   * @throws HttpException in case operation failure
   */
  async refreshToken(req: Request) {
    const { validUser, account } = await this._validateRequest(req);

    const newTokenEntity = new RefreshToken();
    const [accessToken, refreshToken, deviceID] = await this.createTokens(
      account.email,
      validUser.id,
      newTokenEntity.id,
    );
    newTokenEntity.user = Promise.resolve(validUser);
    newTokenEntity.deviceId = deviceID;
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

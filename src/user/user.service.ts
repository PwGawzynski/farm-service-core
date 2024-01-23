import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Account } from './entities/account.entity';
import { v4 as uuid } from 'uuid';
import { UpdatePasswordDto } from './dto/updatePassword-dto';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '../auth/entities/accessToken.entity';
import { AuthService } from '../auth/auth.service';
import { AuthToken } from '../../internalTypes/Auth/authToken';
import {
  ErrorCodes,
  ErrorPayloadObject,
} from '../../FarmServiceApiTypes/Respnse/errorPayloadObject';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { MailingService } from '../mailing/mailing.service';
import { PersonalData } from '../personal-data/entities/personalData.entity';
import { Address } from '../address/entities/address.entity';
import { UserResponseDto } from './dto/response/user-response.dto';
import * as crypto from 'crypto';
import { AccountResponseDto } from './dto/response/account.response';
import { AddressResponseDto } from '../address/dto/response/address.response.dto';
import { PersonalDataResponseDto } from '../personal-data/dto/response/personalData-response.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly mailer: MailingService,
  ) {}
  /**
   * Used to find in db user with given login
   * @param login -- user login string value
   * @return Promise : User
   */
  async findOne(login: string): Promise<User> {
    return User.findOne({
      where: {
        account: {
          email: login,
        },
      },
    });
  }

  /**
   * Used to find user in db with specific ID
   * @param id user id value
   * @return Promise: User
   */
  async findOneById(id: string) {
    return User.findOne({
      where: {
        id,
      },
    });
  }

  /**
   * Hashes Passwords
   * @param plainPwd - pwd to be hashed
   * @return Promise : string
   * @throws Error in case of failure
   */
  async hashPwd(plainPwd: string): Promise<string> {
    return await bcrypt.hash(plainPwd, 10);
  }

  /**
   * Compares plainString password and hashed password
   * @param plain -- password as plain text
   * @param hashed -- password as hashed string
   * @return Promise : Bool
   */
  async comparePassword(plain: string, hashed: string) {
    const result = await bcrypt.compare(plain, hashed);
    if (result)
      throw new HttpException(
        {
          message: 'Passwords do not match',
          eCode: ErrorCodes.BadData,
        } as ErrorPayloadObject,
        HttpStatus.UNAUTHORIZED,
      );
  }

  /**
   * Driver method to serve register new user ask
   * @param data -- Data specified by DTO type
   * @return ResponseObject with proper code
   */
  async register(data: CreateUserDto) {
    const newUser = new User({ ...data });
    const newAccount = new Account({
      ...data,
      user: undefined,
      activationCode: uuid(),
      password: await this.hashPwd(data.password),
    });
    const newPersonalData = new PersonalData({
      ...data.personal_data,
      phoneNumber: data.personal_data.phone_number,
    });
    const newAddress = new Address({
      ...data.address,
    });

    newUser.personalData = Promise.resolve(newPersonalData);
    newUser.account = Promise.resolve(newAccount);

    await newAccount._shouldNotExist(
      'email',
      'User with given emil is already registered',
    );
    await newPersonalData._shouldNotExist(
      'phoneNumber',
      'Phone number is already registered',
    );

    await newAddress.save();
    await newAccount.save();
    await newPersonalData.save();
    newUser.address = Promise.resolve(newAddress);
    newAccount.user = Promise.resolve(newUser);
    newPersonalData.user = Promise.resolve(newUser);
    await newUser.save();
    newAddress.user = Promise.resolve(newUser);
    /*
     * this is because of bidirectional relation one to one, first we must save
     * account entity  without user id then update it
     */
    newAddress.save();
    newAccount.save();
    newPersonalData.save();

    const accessEntity = new RefreshToken();

    const [accessToken, refreshToken] = await this.authService.createTokens(
      newAccount.email,
      newUser.id,
      accessEntity.id,
    );

    await this.authService.remOldRefreshTokens(await newUser.tokens);
    accessEntity.deviceId = await this.authService.hashData(refreshToken);
    accessEntity.user = Promise.resolve(newUser);
    accessEntity.save();

    /*await this.mailer.sendsMail({
      to: newAccount.email,
      template: 'activateNewAccount',
      subject: `Welcome on board, let's activate your account`,
      context: {
        username: `${newPersonalData.name} ${newPersonalData.surname}`,
        activateLink: `http://localhost:3006/user/activate/${newAccount.activationCode}`,
      },
    });*/

    return {
      code: ResponseCode.ProcessedCorrect,
      payload: {
        access_token: accessToken,
        refresh_token: refreshToken,
      } as AuthToken,
    } as ResponseObject<AuthToken>;
  }

  /**
   * Driver method used to preform update password action
   * @param updatePasswordData -- Data specified By DTO
   * @param user -- userEntity
   * @return ResponseObject with proper code
   */
  async updatePassword(updatePasswordData: UpdatePasswordDto, user: User) {
    const userAccountEntity = await user.account;
    await this.comparePassword(
      updatePasswordData.oldPassword,
      userAccountEntity.password,
    );
    userAccountEntity.password = await this.hashPwd(
      updatePasswordData.newPassword,
    );
    userAccountEntity.save();
    return {
      code: ResponseCode.ProcessedCorrect,
    } as ResponseObject;
  }

  /**
   * Driver to serve delete account ask
   * @param user -- userEntity
   * @return ResponseObject with proper code
   */
  async deleteAccount(user: User) {
    (await user.account).remove();
    user.remove();
    return {
      code: ResponseCode.ProcessedWithoutConfirmationWaiting,
    } as ResponseObject;
  }

  async checkIfUserExist(userIdentifier: string) {
    const user = await this.findOne(userIdentifier);
    console.log(user);
    if (user)
      throw new HttpException('Given user already exist', HttpStatus.CONFLICT);
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: true,
    } as ResponseObject<boolean>;
  }

  async activate(code: string) {
    const account = await Account.findOne({
      where: {
        activationCode: code,
      },
    });
    if (!account) throw new BadRequestException('BAD_CODE');
    account.isActivated = true;
    account.save();
    return {
      code: ResponseCode.ProcessedWithoutConfirmationWaiting,
    } as ResponseObject;
  }

  async me(user: User) {
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new UserResponseDto({
        ...user,
        account: new AccountResponseDto(await user.account),
        address: new AddressResponseDto(await user.address),
        personal_data: new PersonalDataResponseDto(await user.personalData),

      }),
    } as ResponseObject<UserResponseDto>;
  }

  async resetPassword(email: string) {
    if (!email) throw new BadRequestException('BAD_EMAIL');
    const user = await User.findOne({
      where: { account: { email } },
    });
    console.log(user, email);
    if (user) {
      const resetToken = crypto.randomBytes(128).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, 10);
      (await user.account).resetPasswordToken = hashedToken;
      this.mailer.sendsMail({
        to: (await user.account).email,
        template: 'resetPassword',
        subject: `Welcome on board, let's activate your account`,
        context: {
          username: `${(await user.personalData).name}`,
          activateLink: `http://localhost:3006/user/activate/${hashedToken}`,
        },
      });
    }
    return {
      code: ResponseCode.ProcessedCorrect,
    } as ResponseObject;
  }
}

import {
  BadRequestException,
  ConflictException,
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
import { AuthService } from '../auth/auth.service';
import { ErrorPayloadObject } from '../../FarmServiceApiTypes/Respnse/errorPayloadObject';
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
import { CompanyResponseDto } from '../company/dto/response/company.response.dto';
import { Equal } from 'typeorm';
import { UpdateAccountSettingsDto } from './dto/update-account-settings.dto';
import { InvalidRequestCodes } from '../../FarmServiceApiTypes/InvalidRequestCodes';

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
  async findOne(login: string): Promise<User | null> {
    return User.findOne({
      where: {
        account: {
          email: Equal(login),
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
        id: Equal(id),
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
          code: InvalidRequestCodes.account_passwordsDoNotMatch,
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
      password: data.password ? await this.hashPwd(data.password) : null,
    });
    const newPersonalData = new PersonalData({
      ...data.personalData,
    });
    const newAddress = new Address({
      ...data.address,
    });

    newUser.personalData = Promise.resolve(newPersonalData);
    newUser.account = Promise.resolve(newAccount);

    await newAccount._shouldNotExist(
      'email',
      InvalidRequestCodes.account_emailTaken,
    );
    await newPersonalData._shouldNotExist(
      'phoneNumber',
      InvalidRequestCodes.personalData_phoneTaken,
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

    //TODO pre release implement it
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
    } as ResponseObject;
  }

  /**
   * Driver method used to preform update password action
   * @param updatePasswordData -- Data specified By DTO
   * @param user -- userEntity
   * @return ResponseObject with proper code
   */
  async updatePassword(updatePasswordData: UpdatePasswordDto, user: User) {
    const userAccountEntity = await user.account;
    if (!userAccountEntity.password)
      throw new BadRequestException({
        message: 'Bad operation on account',
        code: InvalidRequestCodes.account_badOperationOnAccount,
      } as ErrorPayloadObject);
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
  /*async deleteAccount(user: User) {
    (await user.account).remove();
    user.remove();
    return {
      code: ResponseCode.AssumedOk,
    } as ResponseObject;
  }*/

  async checkIfUserExist(userIdentifier: string) {
    const user = await this.findOne(userIdentifier);
    if (user)
      throw new ConflictException({
        message: 'User already exist',
        code: InvalidRequestCodes.user_userAlreadyExist,
      } as ErrorPayloadObject);
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: true,
    } as ResponseObject<boolean>;
  }

  async activate(code: string) {
    const account = await Account.findOne({
      where: {
        activationCode: Equal(code),
      },
    });
    if (!account)
      throw new BadRequestException({
        message: 'Account not found',
        code: InvalidRequestCodes.account_badActivationCode,
      } as ErrorPayloadObject);
    account.isActivated = true;
    account.save();
    return {
      code: ResponseCode.AssumedOk,
    } as ResponseObject;
  }

  async me(user: User) {
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new UserResponseDto({
        ...user,
        account: new AccountResponseDto(await user.account),
        address: new AddressResponseDto(await user.address),
        personalData: new PersonalDataResponseDto(await user.personalData),
        company: (await user.company)
          ? new CompanyResponseDto({
              ...(await user.company),
              address: new AddressResponseDto(
                await (
                  await user.company
                )?.address,
              ),
            })
          : undefined,
      }),
    } as ResponseObject<UserResponseDto>;
  }

  async resetPassword(email: string) {
    if (!email)
      throw new BadRequestException({
        message: 'Email is required',
        code: InvalidRequestCodes.account_emailRequired,
      } as ErrorPayloadObject);
    const user = await User.findOne({
      where: { account: { email: Equal(email) } },
    });
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

  async changeAccountSettings(user: User, data: UpdateAccountSettingsDto) {
    const account = await user.account;
    for (const key of Object.keys(data)) {
      if (data[key] !== undefined) {
        account[key] = data[key];
      }
    }
    account.save();
    return {
      code: ResponseCode.ProcessedCorrect,
    } as ResponseObject;
  }
}

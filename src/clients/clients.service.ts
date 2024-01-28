import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateClientDto, CreateUserAsClient } from './dto/create-client.dto';
import { UserService } from '../user/user.service';
import { UserRole } from '../../FarmServiceApiTypes/User/Enums';
import * as crypto from 'crypto';
import { Client } from './entities/client.entity';
import { User } from '../user/entities/user.entity';
import { Address } from '../address/entities/address.entity';
import { Company } from '../company/entities/company.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { ClientsResponseDto } from './dto/response/client.response.dto';
import { PersonalDataResponseDto } from '../personal-data/dto/response/personalData-response.dto';
import { ClientsCompanyResponseDto } from '../clients_company/dto/response/clients_company.response';
import { AddressResponseDto } from '../address/dto/response/address.response.dto';
import { ClientsCompanyService } from '../clients_company/clients_company.service';
import { UserResponseDto } from '../user/dto/response/user-response.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly users: UserService,
    private readonly clientsCompany: ClientsCompanyService,
  ) {}

  async _createUser(user: CreateUserAsClient) {
    const randomPwd = crypto.randomBytes(128).toString('hex');
    await this.users.register({
      ...user,
      password: randomPwd,
      role: UserRole.Client,
    });
    const registeredUser = await User.findOne({
      where: {
        account: {
          email: user.email,
        },
      },
    });
    if (!registeredUser)
      throw new InternalServerErrorException('Something went wrong');

    return registeredUser;
  }

  async create(createClientDto: CreateClientDto, company: Company) {
    const registeredUser = await this._createUser(createClientDto.user);

    const client = new Client({
      user: registeredUser,
      isClientOf: Promise.resolve(company),
    });
    await client.save();

    const ClientWithoutCompany = {
      user: new UserResponseDto({
        role: registeredUser.role,
        address: await registeredUser.address,
        personal_data: new PersonalDataResponseDto(
          await (
            await registeredUser
          ).personalData,
        ),
      }),
    } as ClientsResponseDto;

    if (createClientDto.company) {
      const companyAddress = new Address(createClientDto.company.address);
      await companyAddress.save();

      const clients_company = await this.clientsCompany.create(
        client,
        createClientDto.company,
      );
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: new ClientsResponseDto({
          ...ClientWithoutCompany,
          company: new ClientsCompanyResponseDto({
            ...clients_company,
            address: new AddressResponseDto(companyAddress),
          }),
        }),
      } as ResponseObject<ClientsResponseDto>;
    }

    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new ClientsResponseDto(ClientWithoutCompany),
    } as ResponseObject<ClientsResponseDto>;
  }
}

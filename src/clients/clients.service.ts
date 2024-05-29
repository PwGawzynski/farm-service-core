import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateClientDto, CreateUserAsClient } from './dto/create-client.dto';
import { UserService } from '../user/user.service';
import { UserRole } from '../../FarmServiceApiTypes/User/Enums';
import { Client } from './entities/client.entity';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { ClientsResponseDto } from './dto/response/client.response.dto';
import { PersonalDataResponseDto } from '../personal-data/dto/response/personalData-response.dto';
import { ClientsCompanyResponseDto } from '../clients_company/dto/response/clients_company.response';
import { ClientsCompanyService } from '../clients_company/clients_company.service';
import { UserResponseDto } from '../user/dto/response/user-response.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PersonalDataService } from '../personal-data/personal-data.service';
import { AddressService } from '../address/address.service';
import { Account } from '../user/entities/account.entity';
import { CreatePersonalDataDto } from '../personal-data/dto/create-personal-data.dto';
import { CreateAddressDto } from '../address/dto/create-address.dto';
import { PersonalData } from '../personal-data/entities/personalData.entity';
import { ClientsCompany } from '../clients_company/entities/clients_company.entity';
import { Address } from '../address/entities/address.entity';
import { Equal } from 'typeorm';
import { AddressResponseDto } from '../address/dto/response/address.response.dto';
import { InvalidRequestCodes } from '../../FarmServiceApiTypes/InvalidRequestCodes';

@Injectable()
export class ClientsService {
  constructor(
    private readonly user: UserService,
    private readonly clientsCompany: ClientsCompanyService,
    private readonly personalDataService: PersonalDataService,
    private readonly addressService: AddressService,
  ) {}

  async _createResponseDto(
    client: Client,
    user: User,
    personalData: PersonalData,
    clientsCompany: ClientsCompany | null,
  ) {
    return new ClientsResponseDto({
      id: client.id,
      email: (await user.account).email,
      user: new UserResponseDto({
        role: user.role,
        address: new AddressResponseDto({ ...(await user.address) }),
        personalData: new PersonalDataResponseDto({
          ...personalData,
        }),
      }),
      company: clientsCompany
        ? new ClientsCompanyResponseDto({
            ...clientsCompany,
            address: new AddressResponseDto({
              ...(await clientsCompany.address),
            }),
          })
        : undefined,
    });
  }

  async _createUser(user: CreateUserAsClient) {
    await this.user.register({
      ...user,
      password: undefined,
      role: UserRole.Client,
    });
    const registeredUser = await User.findOne({
      where: {
        account: {
          email: Equal(user.email),
        },
      },
    });
    if (!registeredUser)
      throw new InternalServerErrorException({
        message: 'Something went wrong while creating user',
        code: InvalidRequestCodes.client_userNotCreated,
      });

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
        personalData: new PersonalDataResponseDto(
          await registeredUser.personalData,
        ),
      }),
    } as ClientsResponseDto;

    // Client can be created without its company data
    if (createClientDto.company) {
      const clients_company = await this.clientsCompany.create(
        client,
        createClientDto.company,
      );
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: await this._createResponseDto(
          client,
          client.user,
          await client.user.personalData,
          new ClientsCompany({
            ...clients_company,
            address: Promise.resolve(new Address(clients_company.address)),
          }),
        ),
      } as ResponseObject<ClientsResponseDto>;
    }

    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new ClientsResponseDto(ClientWithoutCompany),
    } as ResponseObject<ClientsResponseDto>;
  }

  async all(company: Company) {
    const clients = await company.clients;
    if (!clients)
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: [] as ClientsResponseDto[],
      } as ResponseObject<ClientsResponseDto[]>;

    const clientsResponse = await Promise.all(
      clients.map(async (client) => {
        const user = client.user;
        const personalData = await user.personalData;
        const clientsCompany = await client.company;
        return this._createResponseDto(
          client,
          user,
          personalData,
          clientsCompany,
        );
      }),
    );
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: clientsResponse,
    } as ResponseObject<ClientsResponseDto[]>;
  }

  async _updatePersonalData(
    personalData: CreatePersonalDataDto,
    client: Client,
  ) {
    return this.personalDataService.update({
      ...personalData,
      id: (await client.user.personalData).id,
    });
  }
  async _updateAddress(address: CreateAddressDto, client: Client) {
    return this.addressService.update({
      ...address,
      id: (await client.user.address).id,
    });
  }

  async update(updateData: UpdateClientDto) {
    const { personalData, client, email, address } = updateData;
    if (personalData) {
      const res = await this._updatePersonalData(personalData, client);
      client.user.personalData = Promise.resolve(new PersonalData(res.payload));
    }
    if (address) {
      const res = await this._updateAddress(address, client);
      client.user.address = Promise.resolve(new Address(res.payload));
    }
    const account = await client.user.account;
    if (email)
      // noinspection ES6MissingAwait
      Account.createQueryBuilder()
        .update(account)
        .set({ email })
        .where({ id: account.id })
        .execute();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this._createResponseDto(
        client,
        client.user,
        await client.user.personalData,
        await client.company,
      ),
    } as ResponseObject<ClientsResponseDto>;
  }
}

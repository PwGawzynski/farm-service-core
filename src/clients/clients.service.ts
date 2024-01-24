import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
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
  async create(createClientDto: CreateClientDto, company: Company) {
    const randomPwd = crypto.randomBytes(128).toString('hex');
    console.log(randomPwd);
    await this.users.register({
      ...createClientDto.user,
      password: randomPwd,
      role: UserRole.Client,
    });
    const registeredUser = await User.findOne({
      where: {
        account: {
          email: createClientDto.user.email,
        },
      },
    });

    const companyAddress = new Address(createClientDto.company.address);
    await companyAddress.save();

    const client = new Client({
      user: registeredUser,
      isClientOf: Promise.resolve(company),
    });
    await client.save();

    const clients_company = await this.clientsCompany.create(
      client,
      createClientDto.company,
    );

    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new ClientsResponseDto({
        user: new UserResponseDto({
          role: registeredUser.role,
          address: await registeredUser.address,
          personal_data: new PersonalDataResponseDto(
            await (
              await registeredUser
            ).personalData,
          ),
        }),
        company: new ClientsCompanyResponseDto({
          ...clients_company,
          address: new AddressResponseDto(companyAddress),
        }),
      }),
    } as ResponseObject<ClientsResponseDto>;
  }
}

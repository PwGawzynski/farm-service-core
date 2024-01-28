import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './entities/company.entity';
import { Address } from '../address/entities/address.entity';
import { User } from '../user/entities/user.entity';
import { CompanyResponseBase } from '../../FarmServiceApiTypes/Company/Responses';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { CompanyResponseDto } from './dto/response/company.response.dto';
import { AddressResponseDto } from '../address/dto/response/address.response.dto';
import { ClientsResponseDto } from '../clients/dto/response/client.response.dto';
import { UserResponseDto } from '../user/dto/response/user-response.dto';
import { PersonalDataResponseDto } from '../personal-data/dto/response/personalData-response.dto';

@Injectable()
export class CompanyService {
  async create(createCompanyDto: CreateCompanyDto, owner: User) {
    const address = new Address({ ...createCompanyDto.address });
    await address.save();
    const company = new Company({
      ...createCompanyDto,
      address: Promise.resolve(address),
      owner: Promise.resolve(owner),
    });

    const exist = await Company.findOne({
      where: {
        owner: {
          id: owner.id,
        },
      },
    });
    if (exist) throw new ConflictException('User already has company');
    await company._shouldNotExist('email', 'Email is already in use');
    await company._shouldNotExist('name', 'Name is already in use');
    await company._shouldNotExist(
      'phoneNumber',
      'PhoneNumber is already in use',
    );
    await company._shouldNotExist('NIP', 'NIP is already in use');
    company.save();

    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new CompanyResponseDto({
        ...company,
        address: new AddressResponseDto({ ...address }),
      }),
    } as ResponseObject<CompanyResponseBase>;
  }

  async get(company: Company) {
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new CompanyResponseDto({
        ...(await company),
        address: await (await company).address,
      }),
    } as ResponseObject<CompanyResponseBase>;
  }

  async getClients(company: Company) {
    const clients = await company.clients;
    const clientsResponse = clients?.map(async (client) => {
      const user = client.user;
      console.log(user, 'user');
      const address = await user.address;
      const personalData = await user.personalData;
      return new ClientsResponseDto({
        user: new UserResponseDto({
          address: new AddressResponseDto(address),
          role: user.role,
          personal_data: new PersonalDataResponseDto(personalData),
        }),
      });
    });
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: clientsResponse ? await Promise.all(clientsResponse) : [],
    } as ResponseObject<ClientsResponseDto[]>;
  }
}

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
import { Equal } from 'typeorm';
import { ErrorPayloadObject } from '../../FarmServiceApiTypes/Respnse/errorPayloadObject';
import { InvalidRequestCodes } from '../../FarmServiceApiTypes/InvalidRequestCodes';

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
          id: Equal(owner.id),
        },
      },
    });
    if (exist)
      throw new ConflictException({
        message: 'Company already exists',
        code: InvalidRequestCodes.company_alreadyExists,
      } as ErrorPayloadObject);
    await company._shouldNotExist(
      'email',
      InvalidRequestCodes.company_emailTaken,
    );
    await company._shouldNotExist(
      'name',
      InvalidRequestCodes.company_nameTaken,
    );
    await company._shouldNotExist(
      'phoneNumber',
      InvalidRequestCodes.company_phoneTaken,
    );
    await company._shouldNotExist('NIP', InvalidRequestCodes.company_NIPTaken);
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
        id: client.id,
        email: (await user.account).email,
        user: new UserResponseDto({
          address: new AddressResponseDto(address),
          role: user.role,
          personalData: new PersonalDataResponseDto(personalData),
        }),
      });
    });
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: clientsResponse ? await Promise.all(clientsResponse) : [],
    } as ResponseObject<ClientsResponseDto[]>;
  }
}

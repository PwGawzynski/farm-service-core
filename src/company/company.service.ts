import { Injectable } from '@nestjs/common';
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

    await company._shouldNotExist('email', 'Email is already in use');
    await company._shouldNotExist(
      'owner',
      'User is already an owner of a company',
    );
    await company._shouldNotExist('name', 'Name is already in use');
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
        address: new AddressResponseDto(await (await company).address),
      }),
    } as ResponseObject<CompanyResponseBase>;
  }
}

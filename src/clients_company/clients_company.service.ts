import { Injectable } from '@nestjs/common';
import { Client } from '../clients/entities/client.entity';
import { CreateClientsCompanyDto } from './dto/create-clients_comapny.dto';
import { ClientsCompany } from './entities/clients_company.entity';
import { Address } from '../address/entities/address.entity';
import { ClientsCompanyResponseDto } from './dto/response/clients_company.response';
import { AssignCompanyDataToClientDto } from './dto/assign_company.dto';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { UpdateClientsCompanyDto } from './dto/update-clients_company.dto';

@Injectable()
export class ClientsCompanyService {
  async _createResBase(company: ClientsCompany) {
    return new ClientsCompanyResponseDto({
      ...company,
      address: await company.address,
    });
  }
  async _createResObject(company: ClientsCompany) {
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this._createResBase(company),
    } as ResponseObject<ClientsCompanyResponseDto>;
  }

  async create(
    client: Client,
    createClientsCompanyDto: CreateClientsCompanyDto,
  ) {
    const companyAddress = new Address(createClientsCompanyDto.address);
    const clients_company = new ClientsCompany({
      ...createClientsCompanyDto,
      address: Promise.resolve(companyAddress),
      client: client,
    });
    await clients_company._shouldNotExist('NIP', 'NIP already exists');
    await clients_company._shouldNotExist('email', 'Email already exists');
    await clients_company._shouldNotExist('name', 'Name already exists');
    await companyAddress.save();
    clients_company.save();
    return this._createResBase(clients_company);
  }

  async assignCompanyToClient(data: AssignCompanyDataToClientDto) {
    console.log(data);
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.create(data.client, data),
    } as ResponseObject<ClientsCompanyResponseDto>;
  }

  async update(updateData: UpdateClientsCompanyDto) {
    const { company, ...data } = updateData;
    const oldCompany = company;

    company.email = data.email || oldCompany.email;
    company.name = data.name || oldCompany.name;
    company.NIP = data.NIP || oldCompany.NIP;
    company.phoneNumber = data.phoneNumber || oldCompany.phoneNumber;
    const address = new Address(data.address) || company.address;
    company.address = Promise.resolve(address);

    if (updateData.company.NIP !== oldCompany.NIP)
      await company._shouldNotExist('NIP', 'NIP already exists');
    if (updateData.company.email !== oldCompany.email)
      await company._shouldNotExist('email', 'Email already exists');
    if (updateData.company.name !== oldCompany.name)
      await company._shouldNotExist('name', 'Name already exists');

    // noinspection ES6MissingAwait
    ClientsCompany.createQueryBuilder()
      .update(company)
      .set({
        address: Promise.resolve(address),
        NIP: updateData.NIP,
        email: updateData.email,
        name: updateData.name,
        phoneNumber: updateData.phoneNumber,
      })
      .where('id = :id', { id: company.id })
      .execute();

    return this._createResObject(company);
  }
}

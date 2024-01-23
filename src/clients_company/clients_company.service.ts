import { Injectable } from '@nestjs/common';
import { Client } from '../clients/entities/client.entity';
import { CreateClientsCompanyDto } from './dto/create-clients_comapny.dto';
import { ClientsCompany } from './entities/clients_company.entity';
import { Address } from '../address/entities/address.entity';
import { ClientsCompanyResponseDto } from './dto/response/clients_company.response';

@Injectable()
export class ClientsCompanyService {
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
    return new ClientsCompanyResponseDto({
      ...clients_company,
      address: companyAddress,
    });
  }
}

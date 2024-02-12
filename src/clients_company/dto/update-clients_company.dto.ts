import { PartialType } from '@nestjs/mapped-types';
import { CreateClientsCompanyDto } from './create-clients_comapny.dto';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { ClientsCompany } from '../entities/clients_company.entity';

export class UpdateClientsCompanyDto extends PartialType(
  CreateClientsCompanyDto,
) {
  @FindOrReject(ClientsCompany, { message: 'Company not found' })
  company: ClientsCompany;
}

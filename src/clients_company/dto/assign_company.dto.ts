import { BaseCompanyDto } from '../../company/dto/create-company.dto';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Client } from '../../clients/entities/client.entity';

export class AssignCompanyDataToClientDto extends BaseCompanyDto {
  @FindOrReject(Client, { message: 'Client not found' })
  client: Client;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAsClient } from './create-client.dto';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Client } from '../entities/client.entity';

export class UpdateClientDto extends PartialType(CreateUserAsClient) {
  @FindOrReject(Client, { message: 'Client not found' })
  client: Client;
}

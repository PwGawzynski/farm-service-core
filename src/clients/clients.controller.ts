import { Controller, Post, Body } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { Owner } from '../../decorators/auth.decorators';
import { GetOwnedCompany } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Owner()
  create(
    @Body() createClientDto: CreateClientDto,
    @GetOwnedCompany() company: Company,
  ) {
    return this.clientsService.create(createClientDto, company);
  }
}

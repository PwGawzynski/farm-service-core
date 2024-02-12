import { Body, Controller, Post, Put } from '@nestjs/common';
import { ClientsCompanyService } from './clients_company.service';
import { Owner } from '../../decorators/auth.decorators';
import { AssignCompanyDataToClientDto } from './dto/assign_company.dto';
import { UpdateClientsCompanyDto } from './dto/update-clients_company.dto';

@Controller('clients-company')
export class ClientsCompanyController {
  constructor(private readonly clientsCompanyService: ClientsCompanyService) {}

  @Post()
  @Owner()
  assignCompanyToClient(
    @Body() assignCompanyDto: AssignCompanyDataToClientDto,
  ) {
    return this.clientsCompanyService.assignCompanyToClient(assignCompanyDto);
  }

  @Put()
  @Owner()
  update(@Body() updateData: UpdateClientsCompanyDto) {
    return this.clientsCompanyService.update(updateData);
  }
}

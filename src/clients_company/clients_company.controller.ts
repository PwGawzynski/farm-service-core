import { Controller } from '@nestjs/common';
import { ClientsCompanyService } from './clients_company.service';

@Controller('clients-company')
export class ClientsCompanyController {
  constructor(private readonly clientsCompanyService: ClientsCompanyService) {}
}

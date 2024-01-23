import { Module } from '@nestjs/common';
import { ClientsCompanyService } from './clients_company.service';
import { ClientsCompanyController } from './clients_company.controller';

@Module({
  controllers: [ClientsCompanyController],
  providers: [ClientsCompanyService],
  exports: [ClientsCompanyService],
})
export class ClientsCompanyModule {}

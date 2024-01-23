import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { UserModule } from '../user/user.module';
import { ClientsCompanyModule } from '../clients_company/clients_company.module';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  imports: [UserModule, ClientsCompanyModule],
})
export class ClientsModule {}

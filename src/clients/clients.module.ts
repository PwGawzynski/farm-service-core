import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { UserModule } from '../user/user.module';
import { ClientsCompanyModule } from '../clients_company/clients_company.module';
import { PersonalDataModule } from '../personal-data/personal-data.module';
import { AddressModule } from '../address/address.module';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  imports: [
    UserModule,
    ClientsCompanyModule,
    PersonalDataModule,
    AddressModule,
  ],
})
export class ClientsModule {}

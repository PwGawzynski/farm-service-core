import { Module } from '@nestjs/common';
import { FieldAddressService } from './field-address.service';
import { FieldAddressController } from './field-address.controller';

@Module({
  controllers: [FieldAddressController],
  providers: [FieldAddressService],
})
export class FieldAddressModule {}

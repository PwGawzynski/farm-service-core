import { Module } from '@nestjs/common';
import { PersonalDataService } from './personal-data.service';
import { PersonalDataController } from './personal-data.controller';

@Module({
  controllers: [PersonalDataController],
  providers: [PersonalDataService],
})
export class PersonalDataModule {}

import { Controller } from '@nestjs/common';
import { PersonalDataService } from './personal-data.service';

@Controller('personal-data')
export class PersonalDataController {
  constructor(private readonly personalDataService: PersonalDataService) {}
}

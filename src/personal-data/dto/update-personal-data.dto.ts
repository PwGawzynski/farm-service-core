import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonalDataDto } from './create-personal-data.dto';

export class UpdatePersonalDataDto extends PartialType(CreatePersonalDataDto) {
  id: string;
}

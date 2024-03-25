import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldAddressDto } from './create-field-address.dto';

export class UpdateFieldAddressDto extends PartialType(CreateFieldAddressDto) {}

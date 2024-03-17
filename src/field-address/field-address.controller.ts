import { Controller } from '@nestjs/common';
import { FieldAddressService } from './field-address.service';
/*import { ApiTags } from '@nestjs/swagger';
@ApiTags('Field')*/
@Controller('field-address')
export class FieldAddressController {
  constructor(private readonly fieldAddressService: FieldAddressService) {}
}

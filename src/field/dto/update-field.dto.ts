import { CreateFieldDto } from './create-field.dto';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Field } from '../entities/field.entity';

export class UpdateFieldDto extends CreateFieldDto {
  @FindOrReject(Field, { message: 'Cannot find given field' })
  field: Field;
}

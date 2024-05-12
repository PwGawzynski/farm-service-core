import { IsUUID } from 'class-validator';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Task } from '../../task/entities/task.entity';

export class AccountOrderDto {
  @IsUUID(undefined, { each: true })
  @FindOrReject(Task, { each: true, message: 'Task not found' })
  tasks: Task[];
}

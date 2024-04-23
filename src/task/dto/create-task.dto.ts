import { Order } from '../../order/entities/order.entity';
import { Worker } from '../../worker/entities/worker.entity';
import { Field } from '../../field/entities/field.entity';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Type } from 'class-transformer';
import { Machine } from '../../machine/entities/machine.entity';
import { Task } from '../entities/task.entity';
import { TaskType } from '../../../FarmServiceApiTypes/Task/Enums';

export class CreateTaskDto {
  @IsUUID()
  @FindOrReject(Order, { message: 'Cannot find given order' })
  order: Order;
  @IsUUID()
  @FindOrReject(Worker, { message: 'Cannot find given worker' })
  worker: Worker;
  @IsUUID()
  @FindOrReject(Field, { message: 'Cannot find given field' })
  field: Field;

  @IsUUID()
  @FindOrReject(Machine, { message: 'Cannot find given field' })
  machine: Machine;

  @IsEnum(TaskType)
  type: TaskType;

  *[Symbol.iterator]() {
    yield this.order;
    yield this.field;
    yield this.type;
    yield this.worker;
  }
}

export class CrateTaskCollection {
  @IsArray()
  @Type(() => CreateTaskDto)
  @ValidateNested()
  tasks: Array<CreateTaskDto>;
}

export class AssignMachinesDto {
  @FindOrReject(Task, { message: 'Cannot find given task' })
  taskId: Task;

  @IsArray()
  @IsDefined()
  @FindOrReject(Machine, { each: true })
  machines: Array<Machine>;
}

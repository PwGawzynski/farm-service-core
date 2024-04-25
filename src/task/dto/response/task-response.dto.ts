import { Exclude, Expose } from 'class-transformer';
import { TaskType } from '../../../../FarmServiceApiTypes/Task/Enums';
import { FieldResponseDto } from '../../../field/dto/response/field.response';
import { WorkerResponseDto } from '../../../worker/dto/response/worker-response.dto';
import { MachineResponseDto } from '../../../machine/dto/response/machine.response.dto';
import { TaskSessionResponseDto } from '../../../task-session/dto/response/task-session-response.dto';

export class CreateTaskResponseWhiteList {
  constructor(partial: Partial<CreateTaskResponseWhiteList>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: string;

  @Expose()
  isDone?: boolean;

  @Expose()
  type: TaskType;

  @Expose()
  performanceDate: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  lastPausedAt: Date;

  @Expose()
  openedAt?: Date;

  @Expose()
  closedAt?: Date;

  @Expose()
  field: FieldResponseDto;

  @Expose()
  worker: WorkerResponseDto;

  @Expose()
  machine: MachineResponseDto;

  @Expose()
  sessions: TaskSessionResponseDto[];
}

@Exclude()
export class TaskResponseDto extends CreateTaskResponseWhiteList {
  constructor(partial: Partial<TaskResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

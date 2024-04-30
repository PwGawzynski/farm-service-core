import { Exclude, Expose } from 'class-transformer';
import { TaskSessionResponseDto } from '../../../task-session/dto/response/task-session-response.dto';
import { ActivityType } from '../../../../FarmServiceApiTypes/Activity/Enums';

export class CreateActivityResponseWhiteList {
  constructor(partial: Partial<CreateActivityResponseWhiteList>) {
    Object.assign(this, partial);
  }

  @Expose()
  session: TaskSessionResponseDto;
  @Expose()
  workerId: string;
  @Expose()
  taskId: string;
  @Expose()
  fieldId: string;
  @Expose()
  workerName: string;
  @Expose()
  workerSurname: string;
  @Expose()
  fieldName: string;
  @Expose()
  type: ActivityType;
}

@Exclude()
export class ActivityResponseDto extends CreateActivityResponseWhiteList {
  constructor(partial: Partial<ActivityResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

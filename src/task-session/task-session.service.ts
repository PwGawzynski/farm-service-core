import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskSession } from './entities/task-session.entity';
import { Equal, IsNull } from 'typeorm';
import { TaskSessionResponseDto } from './dto/response/task-session-response.dto';
import { Task } from '../task/entities/task.entity';
import { TaskSessionEntityDto } from './dto/TaskSessionEntity.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ActivitiesService } from '../activities/activities.service';
import { ErrorPayloadObject } from '../../FarmServiceApiTypes/Respnse/errorPayloadObject';
import { InvalidRequestCodes } from '../../FarmServiceApiTypes/InvalidRequestCodes';

@Injectable()
export class TaskSessionService {
  constructor(private readonly ActivitiesService: ActivitiesService) {}

  async preOpenValidate(workerId: string) {
    const existOpenedSession = await TaskSession.findOne({
      where: {
        task: { worker: { id: Equal(workerId) } },
        closedAt: IsNull(),
      },
    });
    if (existOpenedSession) {
      throw new ConflictException({
        message: 'Another task is already opened, you have to close it first',
        code: InvalidRequestCodes.taskSession_anotherTaskOpened,
      } as ErrorPayloadObject);
    }
  }

  prepareResponseDto(session: TaskSession) {
    return new TaskSessionResponseDto({ ...session });
  }

  async open(
    task: Task,
    sessionData?: TaskSessionEntityDto,
  ): Promise<TaskSession> {
    await this.preOpenValidate((await task.worker).id);
    const session = new TaskSession();
    // it have to be done because task field is null if not awaited
    await task.field;
    await task.worker;
    session.worker = task.worker;
    session.field = task.field;
    session.task = task;
    if (sessionData) {
      session.onOpenWorkerLatitude = sessionData.workerLatitude;
      session.onOpenWorkerLongitude = sessionData.workerLongitude;
    }
    session.task = task;
    session.save();
    return session;
  }

  async findOpen(t: Task) {
    return TaskSession.findOne({
      where: {
        task: { id: Equal(t.id) },
        closedAt: IsNull(),
      },
    });
  }

  async close(task: Task, sessionData: TaskSessionEntityDto) {
    const session = await this.findOpen(task);
    if (session) {
      session.closedAt = new Date();
      session.onCloseWorkerLatitude = sessionData.workerLatitude;
      session.onCloseWorkerLongitude = sessionData.workerLongitude;
      session.save();
      return session;
    }
  }

  async closeByOwner(task: Task) {
    const session = await this.findOpen(task);
    if (session) {
      session.closedAt = new Date();
      session.save();
      return session;
    }
    throw new NotFoundException({
      message: 'Task session not found',
      code: InvalidRequestCodes.taskSession_notFound,
    } as ErrorPayloadObject);
  }
}

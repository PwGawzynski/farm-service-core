import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TaskSessionService } from '../task-session/task-session.service';
import { concatMap, interval, startWith, timeout } from 'rxjs';
import { Equal } from 'typeorm';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { Company } from '../company/entities/company.entity';
import { TaskSession } from '../task-session/entities/task-session.entity';
import { ActivityResponseDto } from './dto/response/activity-response.dto';
import { ActivityType } from '../../FarmServiceApiTypes/Activity/Enums';

@Injectable()
export class ActivitiesService {
  constructor(private readonly TaskSessionService: TaskSessionService) {}

  private async produceResponseTaskObject(session: TaskSession) {
    return {
      session: await this.TaskSessionService.prepareResponseDto(session),
      workerId: (await session.worker).id,
      fieldId: (await session.field).id,
      taskId: (await session.task).id,
      workerName: (await (await (await session.worker).user).personalData).name,
      workerSurname: (await (await (await session.worker).user).personalData)
        .surname,
      fieldName: (await session.field).nameLabel,
      type: session.closedAt
        ? ActivityType.CLOSE_SESSION
        : ActivityType.OPEN_SESSION,
    } as ActivityResponseDto;
  }

  /**
   * -----------------------------SSE METHODS--------------------------------
   */
  async companyActivities(company: Company) {
    return interval(30000).pipe(
      startWith(0),
      concatMap(async () => {
        const sessions = await TaskSession.find({
          where: { task: { worker: { company: { id: Equal(company.id) } } } },
        });
        if (sessions.length) {
          const activities = await Promise.all(
            sessions.map(async (s) => {
              return await this.produceResponseTaskObject(s);
            }),
          );
          return JSON.stringify({
            code: ResponseCode.ProcessedCorrect,
            payload: activities,
          } as ResponseObject<ActivityResponseDto[]>);
        }
      }),
      timeout(1000 * 60 * 60 * 24),
    );
  }
}

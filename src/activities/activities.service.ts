import { Injectable } from '@nestjs/common';
import { concatMap, interval, startWith, timeout } from 'rxjs';
import { Equal } from 'typeorm';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { Company } from '../company/entities/company.entity';
import { TaskSession } from '../task-session/entities/task-session.entity';
import { ActivityType } from '../../FarmServiceApiTypes/Activity/Enums';
import { Activity } from './entities/activity.entity';
import { CompanyActivityResponseDto } from './dto/response/comapny-activity-response.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ActivitiesService {
  private async produceSessionActivityResponse(activity: Activity) {
    const causer = activity.causer;
    return {
      sessionId: activity.session.id,
      taskId: (await activity.task).id,
      fieldId: (await activity.field).id,
      causerId: activity.causer.id,
      causerShortcutData: {
        name: (await causer.personalData).name,
        surname: (await causer.personalData).surname,
        role: causer.role,
      },
      fieldShortcutData: {
        nameLabel: (await activity.field).nameLabel,
      },
      type: activity.type,
      actionDate: activity.actionDate,
    } as CompanyActivityResponseDto;
  }

  async createSessionActivity(
    session: TaskSession,
    causer: User,
    actionType: ActivityType,
  ) {
    const worker = await session.worker;
    const field = session.field;
    const task = session.task;
    const company = await await worker.company;
    const activity = new Activity({
      type: actionType,
      causer: causer,
      company,
      field,
      task: Promise.resolve(task),
      session: session,
      causerRole: causer.role,
    });
    activity.save();
    return activity;
  }

  /**
   * -----------------------------SSE METHODS--------------------------------
   */
  async getByCompany(company: Company) {
    let prevActivitiesLen = 0;
    return interval(10000).pipe(
      startWith(0),
      concatMap(async () => {
        const activities = await Activity.find({
          where: { company: { id: Equal(company.id) } },
        });
        console.log(activities[0], 'TEST');
        if (activities.length) {
          if (prevActivitiesLen !== activities.length) {
            prevActivitiesLen = activities.length;
            return JSON.stringify({
              code: ResponseCode.ProcessedCorrect,
              payload: await Promise.all(
                activities.map(
                  async (a) => await this.produceSessionActivityResponse(a),
                ),
              ),
            } as ResponseObject<CompanyActivityResponseDto[]>);
          }
        }
      }),
      timeout(1000 * 60 * 60 * 24),
    );
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrateTaskCollection, CreateTaskDto } from './dto/create-task.dto';
import { Company } from '../company/entities/company.entity';
import { Task } from './entities/task.entity';
import { TaskResponseDto } from './dto/response/task-response.dto';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FieldService } from '../field/field.service';
import { WorkerService } from '../worker/worker.service';
import { MachineService } from '../machine/machine.service';
import { Order } from '../order/entities/order.entity';
import { TaskSessionService } from '../task-session/task-session.service';
/* eslint-enable @typescript-eslint/no-unused-vars */
import { Equal } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { concatMap, interval, startWith, timeout } from 'rxjs';
import { Worker } from '../worker/entities/worker.entity';
import { TaskSession } from '../task-session/entities/task-session.entity';
import { TaskSessionEntityDto } from '../task-session/dto/TaskSessionEntity.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../../FarmServiceApiTypes/Activity/Enums';
import { OrderStatus } from '../../FarmServiceApiTypes/Order/Enums';
import { ErrorPayloadObject } from '../../FarmServiceApiTypes/Respnse/errorPayloadObject';
import { InvalidRequestCodes } from '../../FarmServiceApiTypes/InvalidRequestCodes';

@Injectable()
export class TaskService {
  constructor(
    private readonly FieldService: FieldService,
    private readonly WorkerService: WorkerService,
    private readonly MachineService: MachineService,
    private readonly TaskSessionService: TaskSessionService,
    private readonly ActivitiesService: ActivitiesService,
  ) {}

  /**
   * -----------------------------HELPER METHODS--------------------------------
   */

  private async updateSessions(
    task: Task,
    updatedSession: TaskSession | undefined,
  ) {
    const oldSessions = await task.sessions;
    if (!oldSessions?.length && updatedSession) {
      task.sessions = Promise.resolve([updatedSession]);
    } else if (updatedSession && oldSessions?.length) {
      task.sessions = Promise.resolve(
        oldSessions
          .filter((s) => s.id !== updatedSession.id)
          .concat(updatedSession),
      );
    }
  }

  async produceResponseTaskObject(t: Task) {
    const sessions = await t.sessions;
    return {
      id: t.id,
      isDone: t.isDone,
      type: t.type,
      createdAt: t.createdAt,
      openedAt: t.openedAt,
      closedAt: t.closedAt,
      lastPausedAt: t.lastPausedAt,
      performanceDate: t.performanceDate,
      field: await this.FieldService.prepareResponseDto(
        await t.field,
        await (
          await t.field
        ).address,
      ),
      worker: await this.WorkerService.prepareCreateWorkerResponseDto(
        await t.worker,
      ),
      machine: await this.MachineService.prepareResponseDto(await t.machine),
      sessions: sessions?.map((s) =>
        this.TaskSessionService.prepareResponseDto(s),
      ),
    } as TaskResponseDto;
  }

  /**
   * -----------------------------VALIDATION METHODS--------------------------------
   */

  async findAndValidate(taskId: string, worker: Worker) {
    const task = await Task.findOne({ where: { id: Equal(taskId) } });
    const exist = (await worker.tasks)?.find((t) => t.id === taskId);
    if (!exist || !task)
      throw new NotFoundException({
        message: 'Task not found',
        code: InvalidRequestCodes.task_notFound,
      } as ErrorPayloadObject);
    return task;
  }

  private async onCreateValidate(
    createTaskDto: CreateTaskDto,
    company: Company,
  ) {
    const { worker, order, field } = createTaskDto;
    const alreadyExist = await Task.findOne({
      where: {
        worker: { id: Equal(worker.id) },
        field: { id: Equal(field.id) },
        // we have to cast string to number because of typeorm and mysql ( enum can be found as string )
        type: Equal(createTaskDto.type.toString() as unknown as number),
        machine: { id: Equal(createTaskDto.machine.id) },
      },
    });
    if (alreadyExist)
      throw new ConflictException({
        message: `You can't create two the same tasks`,
        code: InvalidRequestCodes.task_taskAlreadyExist,
      } as ErrorPayloadObject);
    const isWorkerOf = (await worker.company).id === company.id;
    const isOrderOf = (await order.company).id === company.id;
    const fieldOwner = await await (await field.owner).client;
    const isFieldOfCompanyClient =
      (await fieldOwner?.isClientOf)?.id === company.id;
    if (!isWorkerOf)
      throw new ConflictException({
        message: 'Given worker is not a worker of your company',
        code: InvalidRequestCodes.task_workerNotInCompany,
      } as ErrorPayloadObject);
    if (!isOrderOf)
      throw new ConflictException({
        code: InvalidRequestCodes.task_orderNotInCompany,
        message: 'Given order does not belong to your company',
      } as ErrorPayloadObject);
    if (!isFieldOfCompanyClient)
      throw new ConflictException({
        message: `Given field[${field.nameLabel}] does not belong to your company`,
        code: InvalidRequestCodes.task_fieldNotInCompany,
      } as ErrorPayloadObject);
  }

  private async onGetByCompanyValidate(
    orderId: string,
    company: Company,
  ): Promise<Order> {
    const order = await Order.findOne({
      where: { id: Equal(orderId) },
    });
    if (!order)
      throw new NotFoundException({
        message: 'Order not found',
        code: InvalidRequestCodes.order_notFound,
      } as ErrorPayloadObject);
    const isOrderOfCompany = (await order.company).id === company.id;
    if (!isOrderOfCompany)
      throw new ConflictException({
        message: 'Order not found in your company',
        code: InvalidRequestCodes.order_notInCompany,
      } as ErrorPayloadObject);
    return order;
  }

  private async onDeleteValidate(id: string, company: Company): Promise<Task> {
    const task = await Task.findOne({
      where: { id: Equal(id) },
    });
    if (!task)
      throw new NotFoundException({
        message: 'Task not found',
        code: InvalidRequestCodes.task_notFound,
      } as ErrorPayloadObject);
    const isTaskOfCompany = (await task.company).id === company.id;
    if (!isTaskOfCompany)
      throw new ConflictException({
        message: 'Task not found in your company',
        code: InvalidRequestCodes.task_notInCompany,
      } as ErrorPayloadObject);
    return task;
  }

  private validateSessionData(sessionData: TaskSessionEntityDto) {
    if (!sessionData.workerLatitude || !sessionData.workerLongitude)
      throw new ConflictException({
        message: 'Worker location is required',
        code: InvalidRequestCodes.task_workerLocationRequired,
      } as ErrorPayloadObject);
  }

  private taskOpenedUnfinished(task: Task) {
    if (!task.openedAt || task.closedAt || task.isDone)
      throw new ConflictException({
        message:
          "Cannot close task with hasn't been opened, or is already done",
        code: InvalidRequestCodes.task_taskNotOpened,
      } as ErrorPayloadObject);
  }

  private async validateOrderStatus(order: Order, expectedStatus: OrderStatus) {
    if (order.status !== expectedStatus)
      throw new ConflictException({
        code: InvalidRequestCodes.order_invalidStatus,
        message: 'Order is not in correct status',
      } as ErrorPayloadObject);
  }

  /**
   * -----------------------------CRUD METHODS--------------------------------
   */

  async create(createTaskDto: CrateTaskCollection, company: Company) {
    await Promise.all(
      createTaskDto.tasks.map((task) => {
        return this.onCreateValidate(task as unknown as CreateTaskDto, company);
      }),
    );
    const { tasks } = createTaskDto;
    const createdTasks: TaskResponseDto[] = [];
    let prevOrder: Order | undefined;
    for (const task of tasks) {
      if (!prevOrder) {
        prevOrder = await task.order;
        task.order.status = OrderStatus.TaskAssigned;
        task.order.save();
      } else if (prevOrder.id !== task.order.id) {
        prevOrder = task.order;
        task.order.status = OrderStatus.TaskAssigned;
        task.order.save();
      }
      const newTask = new Task({
        ...task,
        id: uuid(),
        order: Promise.resolve(task.order),
        company: Promise.resolve(company),
        field: Promise.resolve(task.field),
        worker: Promise.resolve(task.worker),
        machine: Promise.resolve(task.machine),
        createdAt: new Date(),
        performanceDate: task.order.performanceDate,
      });
      newTask.save();
      createdTasks.push(await this.produceResponseTaskObject(newTask));
    }
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: createdTasks,
    } as ResponseObject<TaskResponseDto[]>;
  }

  async getByCompany(company: Company, orderId: string) {
    await this.onGetByCompanyValidate(orderId, company);
    const tasks = await Task.find({
      where: { order: { id: Equal(orderId) } },
    });
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await Promise.all(
        tasks.map(async (t) => this.produceResponseTaskObject(t)),
      ),
    } as ResponseObject<TaskResponseDto[]>;
  }

  async delete(id: string, company: Company) {
    const task = await this.onDeleteValidate(id, company);
    task.remove();
    return {
      code: ResponseCode.ProcessedCorrect,
    } as ResponseObject;
  }

  async startTask(
    taskId: string,
    worker: Worker,
    sessionData: TaskSessionEntityDto,
  ) {
    const task = await this.findAndValidate(taskId, worker);
    if (task.openedAt || task.isDone || task.closedAt)
      throw new ConflictException({
        message: 'Task already started or is done',
        code: InvalidRequestCodes.task_taskAlreadyStarted,
      } as ErrorPayloadObject);
    this.validateSessionData(sessionData);
    const openedSession = await this.TaskSessionService.open(task, sessionData);
    await this.validateOrderStatus(await task.order, OrderStatus.TaskAssigned);
    (await task.order).status = OrderStatus.Processing;
    if (openedSession) {
      this.ActivitiesService.createSessionActivity(
        openedSession,
        await worker.user,
        ActivityType.OPEN_TASK,
      );
      task.openedAt = new Date();
      task.save();
      await this.updateSessions(task, openedSession);
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: await this.produceResponseTaskObject(task),
      } as ResponseObject<TaskResponseDto>;
    }
  }

  async closeTask(
    taskId: string,
    worker: Worker,
    sessionData: TaskSessionEntityDto,
  ) {
    const task = await this.findAndValidate(taskId, worker);
    this.taskOpenedUnfinished(task);
    this.validateSessionData(sessionData);
    const updatedSession = await this.TaskSessionService.close(
      task,
      sessionData,
    );
    await this.validateOrderStatus(await task.order, OrderStatus.TaskAssigned);
    if (updatedSession) {
      this.ActivitiesService.createSessionActivity(
        updatedSession,
        await worker.user,
        ActivityType.CLOSE_TASK,
      );
      task.closedAt = new Date();
      task.isDone = true;
      task.save();
      await this.updateSessions(task, updatedSession);
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: await this.produceResponseTaskObject(task),
      } as ResponseObject<TaskResponseDto>;
    }
  }

  async closeByOwner(taskId: string, company: Company) {
    const task = (await company.tasks)?.find((t) => t.id === taskId);
    if (!task)
      throw new NotFoundException({
        message: 'Task not found',
        code: InvalidRequestCodes.task_notFound,
      } as ErrorPayloadObject);
    await this.validateOrderStatus(await task.order, OrderStatus.TaskAssigned);
    this.taskOpenedUnfinished(task);
    const updatedSession = await this.TaskSessionService.closeByOwner(task);
    if (updatedSession) {
      task.closedAt = new Date();
      task.isDone = true;
      task.save();
      await this.updateSessions(task, updatedSession);
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: await this.produceResponseTaskObject(task),
      } as ResponseObject<TaskResponseDto>;
    }
  }

  async pause(
    taskId: string,
    worker: Worker,
    sessionData: TaskSessionEntityDto,
  ) {
    const task = await this.findAndValidate(taskId, worker);
    this.taskOpenedUnfinished(task);
    const closed = await this.TaskSessionService.close(task, sessionData);
    await this.validateOrderStatus(await task.order, OrderStatus.TaskAssigned);
    if (closed) {
      task.lastPausedAt = new Date();
      this.ActivitiesService.createSessionActivity(
        closed,
        await worker.user,
        ActivityType.OPEN_SESSION,
      );
      task.save();
      await this.updateSessions(task, closed);
    } else {
      this.validateSessionData(sessionData);
      const opened = await this.TaskSessionService.open(task, sessionData);
      if (opened) {
        this.ActivitiesService.createSessionActivity(
          opened,
          await worker.user,
          ActivityType.CLOSE_SESSION,
        );
      }
      await this.updateSessions(task, opened);
    }
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.produceResponseTaskObject(task),
    } as ResponseObject<TaskResponseDto>;
  }

  /**
   * -----------------------------SSE METHODS--------------------------------
   */
  async workerTasks(worker: Worker) {
    let prevTaskLen = 0;
    return interval(30000).pipe(
      startWith(0),
      concatMap(async () => {
        const tasks = await Task.find({
          where: { worker: { id: Equal(worker.id) } },
        });
        if (tasks.length) {
          if (prevTaskLen !== tasks.length) {
            prevTaskLen = tasks.length;
            return JSON.stringify({
              code: ResponseCode.ProcessedCorrect,
              payload: await Promise.all(
                tasks.map(async (t) => await this.produceResponseTaskObject(t)),
              ),
            } as ResponseObject<TaskResponseDto[]>);
          }
        }
      }),
      timeout(1000 * 60 * 60 * 24),
    );
  }
}

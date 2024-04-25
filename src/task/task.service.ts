import { ConflictException, Injectable } from '@nestjs/common';
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

@Injectable()
export class TaskService {
  constructor(
    private readonly FieldService: FieldService,
    private readonly WorkerService: WorkerService,
    private readonly MachineService: MachineService,
    private readonly TaskSessionService: TaskSessionService,
  ) {}

  private async validate(createTaskDto: CreateTaskDto, company: Company) {
    console.log('test');
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
      throw new ConflictException(`You can't create two the same tasks`);
    const isWorkerOf = (await worker.company).id === company.id;
    const isOrderOf = (await order.company).id === company.id;
    const fieldOwner = await await (await field.owner).client;
    const isFieldOfCompanyClient =
      (await fieldOwner?.isClientOf)?.id === company.id;
    if (!isWorkerOf)
      throw new ConflictException(
        'Given worker is not a worker of your company',
      );
    if (!isOrderOf)
      throw new ConflictException(
        `Given order[${order.id}] does not exist in your company`,
      );
    if (!isFieldOfCompanyClient)
      throw new ConflictException(
        `Field owner[${fieldOwner?.id}] is not a client of your company`,
      );
  }

  private async produceResponseTaskObject(t: Task) {
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

  async create(createTaskDto: CrateTaskCollection, company: Company) {
    await Promise.all(
      createTaskDto.tasks.map((task) => {
        return this.validate(task as unknown as CreateTaskDto, company);
      }),
    );
    const { tasks } = createTaskDto;
    const createdTasks: TaskResponseDto[] = [];
    for (const task of tasks) {
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

  private async getAll_findAndValidate(
    orderId: string,
    company: Company,
  ): Promise<Order> {
    const order = await Order.findOne({
      where: { id: Equal(orderId) },
    });
    if (!order) throw new ConflictException('Order not found');
    const isOrderOfCompany = (await order.company).id === company.id;
    if (!isOrderOfCompany)
      throw new ConflictException('Order not found in your company');
    return order;
  }

  async getByCompany(company: Company, orderId: string) {
    await this.getAll_findAndValidate(orderId, company);
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

  private async delete_findAndValidate(
    id: string,
    company: Company,
  ): Promise<Task> {
    const task = await Task.findOne({
      where: { id: Equal(id) },
    });
    if (!task) throw new ConflictException('Task not found');
    const isTaskOfCompany = (await task.company).id === company.id;
    if (!isTaskOfCompany)
      throw new ConflictException('Task not found in your company');
    return task;
  }

  async delete(id: string, company: Company) {
    const task = await this.delete_findAndValidate(id, company);
    task.remove();
    return {
      code: ResponseCode.ProcessedCorrect,
    } as ResponseObject;
  }

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
            console.log(prevTaskLen, 'TEST');
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

  async findAndValidate(taskId: string, worker: Worker) {
    const task = await Task.findOne({ where: { id: Equal(taskId) } });
    const exist = (await worker.tasks)?.find((t) => t.id === taskId);
    if (!exist || !task) throw new ConflictException('Task not found');
    return task;
  }

  async startTask(taskId: string, worker: Worker) {
    const task = await this.findAndValidate(taskId, worker);
    if (task.openedAt || task.isDone || task.closedAt)
      throw new ConflictException(
        'Cannot start task is already opened, or is already done',
      );
    task.openedAt = new Date();
    await this.TaskSessionService.open(task);
    task.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.produceResponseTaskObject(task),
    } as ResponseObject<TaskResponseDto>;
  }

  async closeTask(taskId: string, worker: Worker) {
    const task = await this.findAndValidate(taskId, worker);
    if (!task.openedAt || task.closedAt || task.isDone)
      throw new ConflictException(
        "Cannot close task with hasn't been opened, or is already done",
      );
    await this.TaskSessionService.close(task);
    task.closedAt = new Date();
    task.isDone = true;
    task.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.produceResponseTaskObject(task),
    } as ResponseObject<TaskResponseDto>;
  }

  async pause(taskId: string, worker: Worker) {
    const task = await this.findAndValidate(taskId, worker);
    if (!task.openedAt || task.isDone || task.closedAt)
      // TODO move all strings to JSON
      throw new ConflictException(
        "Cannot pause task with hasn't been opened, or is already done",
      );
    try {
      await this.TaskSessionService.open(task);
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: await this.produceResponseTaskObject(task),
      } as ResponseObject<TaskResponseDto>;
    } catch {
      const updatedSession = await this.TaskSessionService.close(task);
      task.lastPausedAt = new Date();
      task.save();
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
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: await this.produceResponseTaskObject(task),
      } as ResponseObject<TaskResponseDto>;
    }
  }
}

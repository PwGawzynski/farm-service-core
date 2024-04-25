import { Injectable } from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { Company } from '../company/entities/company.entity';
import { Worker } from './entities/worker.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import {
  WorkerIdResponseDto,
  WorkerResponseDto,
} from './dto/response/worker-response.dto';
import { AddressResponseDto } from '../address/dto/response/address.response.dto';
import { PersonalDataResponseDto } from '../personal-data/dto/response/personalData-response.dto';
import { concatMap, filter, interval, take, takeUntil, timeout } from 'rxjs';
import { User } from '../user/entities/user.entity';
import { UpdateWorkerStatusOrPositionDto } from './dto/update-worker.dto';
import { Equal } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Position, Status } from '../../FarmServiceApiTypes/Worker/Enums';

@Injectable()
export class WorkerService {
  async prepareCreateWorkerResponseDto(worker: Worker) {
    const user = await worker.user;
    const account = await user.account;
    const address = await user.address;
    const personalData = await user.personalData;
    console.log({
      id: worker.id,
      status: worker.status,
      position: worker.position,
      email: account.email,
      address: new AddressResponseDto(address),
      personalData: new PersonalDataResponseDto(personalData),
    });
    return new WorkerResponseDto({
      id: worker.id,
      status: worker.status,
      position: worker.position,
      email: account.email,
      address: new AddressResponseDto(address),
      personalData: new PersonalDataResponseDto(personalData),
    });
  }

  async assign(createWorkerDto: CreateWorkerDto, company: Company) {
    const user = createWorkerDto.user;
    const worker = new Worker({
      user: Promise.resolve(user),
      company: Promise.resolve(company),
      id: uuid(),
      status: Status.Active,
      position: Position.Operator,
    });
    const exist = await Worker.findOne({
      where: { user: { id: Equal(user.id) } },
    });
    if (exist) throw new Error('Worker already exist');
    worker.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.prepareCreateWorkerResponseDto(worker),
    } as ResponseObject<WorkerResponseDto>;
  }

  async getInfo(user: User) {
    const worker = await Worker.findOne({
      where: { user: { id: Equal(user.id) } },
    });
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: {
        workerData:
          worker && (await this.prepareCreateWorkerResponseDto(worker)),
        userId: user.id,
      },
    } as ResponseObject<WorkerIdResponseDto>;
  }

  async info(user: User) {
    const timeout$ = interval(60000).pipe(
      concatMap(() => {
        throw Error('Timeout');
      }),
    );
    return interval(2000).pipe(
      concatMap(async () => {
        const worker = await Worker.findOne({
          where: { user: { id: Equal(user.id) } },
        });
        if (worker) {
          return JSON.stringify({
            code: ResponseCode.ProcessedCorrect,
            payload: await this.prepareCreateWorkerResponseDto(worker),
          } as ResponseObject<WorkerResponseDto>);
        }
        return JSON.stringify({
          code: ResponseCode.ErrorOccurred,
        } as ResponseObject<WorkerResponseDto>);
      }),
      filter(
        (result) => JSON.parse(result).code === ResponseCode.ProcessedCorrect,
      ),
      takeUntil(timeout$),
      take(1),
      timeout(60000),
    );
  }

  async getAll(company: Company) {
    const workers = await company.workers;
    if (!workers || workers.length === 0)
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: [],
      } as ResponseObject<WorkerResponseDto[]>;
    const res = await Promise.all(
      workers?.map(
        async (worker) => await this.prepareCreateWorkerResponseDto(worker),
      ),
    );
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: res,
    } as ResponseObject<WorkerResponseDto[]>;
  }

  async updateStatusOrPosition(updateData: UpdateWorkerStatusOrPositionDto) {
    const { worker, status, position } = updateData;
    console.log(updateData);
    if (status !== undefined) worker.status = status;
    if (position !== undefined) worker.position = position;
    worker.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.prepareCreateWorkerResponseDto(worker),
    } as ResponseObject<WorkerResponseDto>;
  }
}

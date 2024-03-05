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

@Injectable()
export class WorkerService {
  async createWorkerResponseDto(worker: Worker) {
    const user = await worker.user;
    const account = await user.account;
    const address = await user.address;
    const personalData = await user.personalData;
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
    });
    await worker._shouldNotExist('user');
    worker.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.createWorkerResponseDto(worker),
    } as ResponseObject<WorkerResponseDto>;
  }

  async getInfo(user: User) {
    const worker = await Worker.findOne({
      where: { user: { id: user.id } },
    });
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: {
        workerData: worker && (await this.createWorkerResponseDto(worker)),
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
        console.log('TEstSee');
        const worker = await Worker.findOne({
          where: { user: { id: user.id } },
        });
        if (worker) {
          return JSON.stringify({
            code: ResponseCode.ProcessedCorrect,
            payload: await this.createWorkerResponseDto(worker),
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
}

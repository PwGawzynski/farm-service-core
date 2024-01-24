import { Injectable } from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { Company } from '../company/entities/company.entity';
import { Worker } from './entities/worker.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { WorkerResponseDto } from './dto/response/worker-response.dto';
import { AddressResponseDto } from '../address/dto/response/address.response.dto';
import { PersonalDataResponseDto } from '../personal-data/dto/response/personalData-response.dto';

@Injectable()
export class WorkerService {
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
      payload: new WorkerResponseDto({
        ...worker,
        email: (await user.account).email,
        address: new AddressResponseDto(await user.address),
        personalData: new PersonalDataResponseDto(await user.personalData),
      }),
    } as ResponseObject<WorkerResponseDto>;
  }
}

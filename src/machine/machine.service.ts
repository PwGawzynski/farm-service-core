import { Injectable } from '@nestjs/common';
import { Company } from '../company/entities/company.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { Machine } from './entities/machine.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { MachineResponseDto } from './dto/response/machine.response.dto';

@Injectable()
export class MachineService {
  create(createMachineDto: CreateMachineDto, company: Company) {
    const machine = new Machine(createMachineDto);
    machine.company = Promise.resolve(company);
    machine.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new MachineResponseDto({ ...machine }),
    } as ResponseObject<MachineResponseDto>;
  }
}

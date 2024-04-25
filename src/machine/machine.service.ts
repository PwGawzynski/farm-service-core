import { ConflictException, Injectable } from '@nestjs/common';
import { Company } from '../company/entities/company.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { Machine } from './entities/machine.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { MachineResponseDto } from './dto/response/machine.response.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MachineService {
  async prepareResponseDto(machine: Machine) {
    return new MachineResponseDto({
      id: machine.id,
      name: machine.name,
      licensePlate: machine.licensePlate,
    });
  }

  async create(createMachineDto: CreateMachineDto, company: Company) {
    const machine = new Machine(createMachineDto);
    machine.company = Promise.resolve(company);
    machine.id = uuid();
    machine.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.prepareResponseDto(machine),
    } as ResponseObject<MachineResponseDto>;
  }

  async getAll(company: Company) {
    const machines = (await company.machines)?.filter((m) => !m.deletedAt);
    if (!machines || machines.length === 0)
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: [],
      } as ResponseObject<MachineResponseDto[]>;
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await Promise.all(machines.map(this.prepareResponseDto)),
    } as ResponseObject<MachineResponseDto[]>;
  }

  async update(updateData: UpdateMachineDto, company: Company) {
    const machine = (await company.machines)?.find(
      (m) => m.id === updateData.machine.id && !m.deletedAt,
    );
    if (!machine) throw new ConflictException('Machine not found');
    machine.name = updateData.name || machine.name;
    machine.licensePlate = updateData.licensePlate || machine.licensePlate;
    machine.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.prepareResponseDto(machine),
    } as ResponseObject<MachineResponseDto>;
  }

  async safelyDelete(deleteData: UpdateMachineDto, company: Company) {
    const machine = (await company.machines)?.find(
      (m) => m.id === deleteData.machine.id && !m.deletedAt,
    );
    if (!machine) throw new ConflictException('Machine not found');
    machine.deletedAt = new Date();
    machine.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.prepareResponseDto(machine),
    } as ResponseObject<MachineResponseDto>;
  }
}

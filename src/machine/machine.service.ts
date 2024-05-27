import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
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
import { ErrorPayloadObject } from '../../FarmServiceApiTypes/Respnse/errorPayloadObject';
import { InvalidRequestCodes } from '../../FarmServiceApiTypes/InvalidRequestCodes';

@Injectable()
export class MachineService {
  //--------------------------------HELPER METHODS--------------------------------//

  /**
   * Prepare response dto
   * @param machine
   * @returns {Promise<MachineResponseDto>}
   */
  async prepareResponseDto(machine: Machine) {
    return new MachineResponseDto({
      id: machine.id,
      name: machine.name,
      licensePlate: machine.licensePlate,
    });
  }

  //--------------------------------VALIDATORS--------------------------------//

  /**
   * Check if license plate is unique
   * @param licensePlate
   * @returns {Promise<void>}
   * @throws {ConflictException} if license plate is not unique
   * @private
   */
  private async _uniqPlate(licensePlate: string) {
    if (await Machine.findOne({ where: { licensePlate } }))
      throw new ConflictException({
        message: 'Machine with this license plate already exists',
        code: InvalidRequestCodes.machine_licencePlateTaken,
      } as ErrorPayloadObject);
  }

  /**
   * Check if the machine belongs to company
   * @param company
   * @param machine
   * @returns {Promise<void>}
   * @throws {BadRequestException} if machine does not belong to company
   * @private
   */
  private async _checkIfBelongs(company: Company, machine: Machine) {
    if (company.id !== (await machine.company)?.id)
      throw new BadRequestException({
        message: 'Machine does not belong to company',
        code: InvalidRequestCodes.machine_doesNotBelongToCompany,
      } as ErrorPayloadObject);
  }

  //--------------------------------CRUD--------------------------------//

  async create(createMachineDto: CreateMachineDto, company: Company) {
    const machine = new Machine(createMachineDto);
    await this._uniqPlate(machine.licensePlate);
    machine.company = Promise.resolve(company);
    machine.id = uuid();
    machine.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.prepareResponseDto(machine),
    } as ResponseObject<MachineResponseDto>;
  }

  /**
   * Returns all undeleted machines, belonging to company
   * @param company
   */
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
    await this._checkIfBelongs(company, updateData.machine);
    const machine = updateData.machine;
    machine.name = updateData.name || machine.name;
    machine.licensePlate = updateData.licensePlate || machine.licensePlate;
    machine.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.prepareResponseDto(machine),
    } as ResponseObject<MachineResponseDto>;
  }

  /**
   * Safely delete machine -- add deletedAt date
   * @param deleteData
   * @param company
   */
  async safelyDelete(deleteData: UpdateMachineDto, company: Company) {
    await this._checkIfBelongs(company, deleteData.machine);
    const machine = deleteData.machine;
    machine.deletedAt = new Date();
    machine.save();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this.prepareResponseDto(machine),
    } as ResponseObject<MachineResponseDto>;
  }
}

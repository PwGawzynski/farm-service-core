import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerDto } from './create-worker.dto';
import { Position, Status } from '../../../FarmServiceApiTypes/Worker/Enums';
import { IsEnum, IsOptional } from 'class-validator';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Worker } from '../entities/worker.entity';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {}

export class UpdateWorkerStatusOrPositionDto {
  @FindOrReject(Worker, { message: 'Cannot find given worker' })
  worker: Worker;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsEnum(Position)
  @IsOptional()
  position?: Position;
}

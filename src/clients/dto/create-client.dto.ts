import { IsDefined, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { CreateClientsCompanyDto } from '../../clients_company/dto/create-clients_comapny.dto';
import { OmitType } from '@nestjs/mapped-types';

class CreateUserAsClient extends OmitType(CreateUserDto, [
  'password',
  'role',
] as const) {}

export class CreateClientDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateUserAsClient)
  user: CreateUserAsClient;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClientsCompanyDto)
  company?: CreateClientsCompanyDto;
}

import {
  ConflictException,
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { printWarnToConsole } from '../Helpers/printWarnToConsole';
import { User } from '../src/user/entities/user.entity';

/**
 * This decorator allow to inject into function param userEntity
 */
export const GetUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    console.log(ctx.switchToHttp().getRequest().user.id, 'user');
    return ctx.switchToHttp().getRequest().user;
  },
);

export const GetOwnedCompany = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    if (!(user instanceof User)) {
      printWarnToConsole('REQ.USER IS UNDEFENDED', 'GET_OWNED_COMPANY');
      throw new InternalServerErrorException(undefined, 'Something went wrong');
    }
    const company = await user.company;
    if (!company) throw new ConflictException("Causer don't have company");
    return company;
  },
);
export const GetWorker = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    if (!(user instanceof User)) {
      printWarnToConsole('REQ.USER IS UNDEFENDED', 'GET_WORKER');
      throw new InternalServerErrorException(undefined, 'Something went wrong');
    }
    const worker = await user.worker;
    if (!worker) throw new ConflictException('Causer is not a  worker');
    return worker;
  },
);
export const GetClient = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    if (!(user instanceof User)) {
      printWarnToConsole('REQ.USER IS UNDEFENDED', 'GET_WORKER');
      throw new InternalServerErrorException(undefined, 'Something went wrong');
    }
    const client = await user.client;
    if (!client) throw new ConflictException('Causer is not a  worker');
    return client;
  },
);

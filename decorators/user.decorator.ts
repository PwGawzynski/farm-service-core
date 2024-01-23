import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { printWarnToConsole } from '../Helpers/printWarnToConsole';

export function throwError(msg: string, warnMsg: string, location: string) {
  printWarnToConsole(warnMsg, location);
  throw new HttpException('Unauthorised. ' + msg, HttpStatus.UNAUTHORIZED);
}

/**
 * This decorator allow to inject into function param userEntity
 */
export const GetUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    console.log(ctx.switchToHttp().getRequest(), 'user');
    return ctx.switchToHttp().getRequest().user;
  },
);

import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { User } from '../src/user/entities/user.entity';
import { printWarnToConsole } from '../Helpers/printWarnToConsole';

export function throwError(msg: string, warnMsg: string, location: string) {
  printWarnToConsole(warnMsg, location);
  throw new HttpException('Unauthorised. ' + msg, HttpStatus.UNAUTHORIZED);
}

/**
 * This decorator allow to inject into function param userEntity
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = User.findOne({
      where: {
        id: request.user.id,
      },
    });
    if (!user) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return user;
  },
);

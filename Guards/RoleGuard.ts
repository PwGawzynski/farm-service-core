import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../src/user/entities/user.entity';
import { printWarnToConsole } from '../Helpers/printWarnToConsole';
import { UserRole } from '../FarmServiceApiTypes/User/Enums';

function matchRoles(roles: Array<UserRole>, userRole: UserRole) {
  if (!roles.includes(userRole))
    throw new ForbiddenException(
      undefined,
      `Your role: ${UserRole[userRole]} is not granted to perform this action`,
    );
  else return true;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get('roles', context.getHandler());
    // due to RolesGuard id APP scope we have to return true if no role is defined
    if (!roles) {
      return true;
    }
    const user = context.switchToHttp().getRequest().user;
    if (user instanceof User) {
      return matchRoles(roles, user.role);
    }
    printWarnToConsole('REQ.USER IS UNDEFENDED', 'ROLES_GUARD');
    throw new HttpException(
      'Something went wrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

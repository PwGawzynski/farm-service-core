import { SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { UserRole } from '../FarmServiceApiTypes/User/Enums';

/**
 * Provides checking if action causer has owner role.
 * @constructor
 */
export const Owner = () => SetMetadata('roles', [UserRole.Owner]);

export const Client = () => SetMetadata('roles', [UserRole.Client]);
export const AllRoles = () =>
  SetMetadata('roles', [UserRole.Client, UserRole.Worker, UserRole.Owner]);

export const OwnerAndClient = () =>
  SetMetadata('roles', [UserRole.Owner, UserRole.Client]);

export const Worker = () => SetMetadata('roles', [UserRole.Worker]);

export const Public = () => SetMetadata(JwtAuthGuard.IS_PUBLIC_PATH, true);
export const AllowOnlyByToken = () =>
  SetMetadata(JwtAuthGuard.IS_ALLOWED_FOR_ALL_USERS, true);

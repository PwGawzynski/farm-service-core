import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshStrategy } from './refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';

@Module({
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.SecretSign,
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

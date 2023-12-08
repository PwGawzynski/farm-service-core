import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { MailingModule } from '../mailing/mailing.module';

@Module({
  controllers: [UserController],
  imports: [forwardRef(() => AuthModule), MailingModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as process from 'process';
import configuration from '../config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from '../ExceptionFilters/GlobalFilter';
import { UserModule } from './user/user.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RoleGuard } from '../Guards/RoleGuard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PersonalDataModule } from './personal-data/personal-data.module';
import { AddressModule } from './address/address.module';
import { CompanyModule } from './company/company.module';
import { ClientsModule } from './clients/clients.module';
import { ClientsCompanyModule } from './clients_company/clients_company.module';
import { WorkerModule } from './worker/worker.module';
import { MachineModule } from './machine/machine.module';
import { FieldModule } from './field/field.module';
import { FieldAddressModule } from './field-address/field-address.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 3306),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      bigNumberStrings: false,
      logging: true,
      autoLoadEntities: true,
    }),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      template: {
        dir: process.cwd() + '/mailTemplates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    UserModule,
    PersonalDataModule,
    AddressModule,
    CompanyModule,
    ClientsModule,
    ClientsCompanyModule,
    WorkerModule,
    MachineModule,
    FieldModule,
    FieldAddressModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}

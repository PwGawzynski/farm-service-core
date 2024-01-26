import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';
import * as process from 'process';
import { printWarnToConsole } from '../../Helpers/printWarnToConsole';

import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { SendMailSettingsObject } from '../../internalTypes/Mailer/sendMailSettingsObject';

@Injectable()
export class MailingService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Method is in charge of refresh access token used  to connect to google api, which is used to send mails
   * @private
   */
  private async setTransport() {
    const OAuth2 = google.auth.OAuth2;
    // set up credentialsObject
    const oauth2Client = new OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    // add refresh token from .env
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
    // call api to try refresh access token
    const accessToken: string = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        console.log(err);
        if (err) {
          printWarnToConsole('Refreshing token failure', 'MailingService');
          reject('Failed to create access token');
        }
        if (!token) {
          reject('Failed to create access token');
          return;
        }
        resolve(token);
      });
    });
    // set up options object to work with Google api
    const config: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('EMAIL'),
        clientId: this.configService.get('CLIENT_ID'),
        clientSecret: this.configService.get('CLIENT_SECRET'),
        accessToken,
      },
    };
    // set up mailer
    this.mailerService.addTransporter('gmail', config);
  }

  /**
   * Method used to send mail to any receiver with any context used handlebars templates
   * @param to - receiver email address
   * @param template - handlebars template name
   * @param subject - mail subject
   * @param context - object that specifies parameters send to handlebar template
   * @param attachments - attachments for mail
   */
  public async sendsMail({
    to,
    template,
    subject,
    context,
    attachments,
  }: SendMailSettingsObject) {
    await this.setTransport();
    this.mailerService
      .sendMail({
        transporterName: 'gmail',
        to,
        from: 'FarmServiceTM@gmail.com',
        subject,
        template,
        context,
        attachments,
      })
      .catch(() => {
        printWarnToConsole(
          'Error occurred when trying to send email',
          'Mailing-Service',
        );
      });
    return {
      code: ResponseCode.ProcessedWithoutConfirmationWaiting,
    } as ResponseObject;
  }
}

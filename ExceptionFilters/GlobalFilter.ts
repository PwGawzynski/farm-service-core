import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { printWarnToConsole } from '../Helpers/printWarnToConsole';
import {
  ErrorCodes,
  ErrorPayloadObject,
} from '../FarmServiceApiTypes/Respnse/errorPayloadObject';
import {
  ResponseCode,
  ResponseObject,
} from '../FarmServiceApiTypes/Respnse/responseGeneric';
import { doesntContains } from '../Helpers/common';

/**
 * Global exception filter, used to filter any exception occurred in app, and send back user-friendly response witch only save for app information
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private _validateErrorResponse(response: any) {
    if (!response?.payload?.code) {
      console.error(
        '\x1b[41m',
        'BAD_RESPONSE_ERROR',
        '\x1b[0m',
        '\x1b[31m',
        'Violation of error return rules, response is string',
        '\x1b[0m',
      );
    } else if (doesntContains(response.payload.code, ErrorCodes)) {
      console.error(
        '\x1b[41m',
        '!!!_CODE_RESERVATION_ERROR_!!!',
        '\x1b[0m',
        '\x1b[31m',
        'This is global exception code, please use another code for your error',
        '\x1b[0m',
      );
    }
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    printWarnToConsole(
      `CAUGHT ERROR`,
      'GlobalExceptionFilter, when processing: ' +
        ctx.getRequest().url +
        ' ' +
        ctx.getRequest().headers['Authorization'],
    );
    /**
     *  Checks exception type and send bask ResponseObject with error code and payload if error is HttpException type,
     *  or ResponseObject with only error code, in case of the others error types, to prevent app structure data leaking
     */
    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const response = exception.getResponse() as ErrorPayloadObject;
      this._validateErrorResponse(response);
      let responseBody = {} as ResponseObject<ErrorPayloadObject>;
      if (!response?.code && typeof response.message === 'string')
        responseBody = {
          code: ResponseCode.Error,
          payload: {
            code: ErrorCodes.UnknownServerError,
            message: response.message,
          },
        };
      else {
        responseBody = {
          code: ResponseCode.Error,
          payload: {
            code: response.code,
            message: response.message,
          },
        };
      }
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    } else
      httpAdapter.reply(
        ctx.getResponse(),
        {
          code: ResponseCode.Error,
          payload: {
            code: ErrorCodes.UnknownServerError,
          },
        } as ResponseObject<ErrorPayloadObject>,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    console.log(exception);
  }
}

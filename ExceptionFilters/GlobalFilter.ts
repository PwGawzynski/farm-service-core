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

/**
 * Global exception filter, used to filter any exception occurred in app, and send back user-friendly response witch only save for app information
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    printWarnToConsole(`CAUGHT ERROR`, 'GlobalExceptionFilter');
    /**
     *  Checks exception type and send bask ResponseObject with error code and payload if error is HttpException type,
     *  or ResponseObject with only error code, in case of the others error types, to prevent app structure data leaking
     */
    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const response = exception.getResponse() as ErrorPayloadObject;
      const message =
        typeof response === 'string' ? response : response.message;
      const responseBody = {
        code: ResponseCode.ErrorOccurred,
        payload: {
          message,
          eCode: response?.eCode,
        },
      } as ResponseObject<ErrorPayloadObject>;
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    } else
      httpAdapter.reply(
        ctx.getResponse(),
        {
          code: ResponseCode.ErrorOccurred,
          payload: {
            eCode: ErrorCodes.UnknownServerError,
          },
        } as ResponseObject<ErrorPayloadObject>,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    console.log(exception);
  }
}

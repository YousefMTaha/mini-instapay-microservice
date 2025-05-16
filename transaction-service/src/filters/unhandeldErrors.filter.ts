import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface ErrorResponse {
  message?: string | string[];
  status?: boolean;
  statusCode?: number;
}

@Catch()
export class UnHandledExceptions implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    if (exception instanceof HttpException) {
      const responseMessage = exception.getResponse();

      if (typeof responseMessage === 'string') {
        message = responseMessage;
      } else if (
        typeof responseMessage === 'object' &&
        responseMessage !== null
      ) {
        const typedResponse = responseMessage as ErrorResponse;
        message = typeof typedResponse.message === 'string' 
          ? typedResponse.message 
          : Array.isArray(typedResponse.message) 
            ? typedResponse.message.join(', ')
            : message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    console.log(exception);
    

    host.switchToHttp().getResponse().status(httpStatus).json({
      statusCode: httpStatus,
      message,
      status: false,
    });
  }
}

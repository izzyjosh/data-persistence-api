import { StatusCodes } from "http-status-codes";

export default class ApiError extends Error {
  status: string;

  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.status = "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad Request") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = "Internal Server Error") {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export class BadGatewayError extends ApiError {
  constructor(message: string = "Bad Gateway") {
    super(message, StatusCodes.BAD_GATEWAY);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = "Validation Error") {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}

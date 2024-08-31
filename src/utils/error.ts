const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 403,
  INTERNAL_SERVER_ERROR: 500,
};

class BaseError extends Error {
  statusCode: number;
  constructor(name: string, statusCode: number, message: string) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.message = message;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}

// 500 Internal Error
class APIError extends BaseError {
  constructor(
    description: string = 'api error',
    statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR,
  ) {
    super('api internal server error', statusCode, description);
  }
}

// 403 Authorize Error
class AuthorizeError extends BaseError {
  constructor(
    description: string = 'access denied',
    statusCode: number = STATUS_CODES.UNAUTHORIZED,
  ) {
    super('access denied', statusCode, description);
  }
}

export { BaseError, APIError, AuthorizeError, STATUS_CODES };

class ApiRoorError extends Error {
  constructor(message, statusCode, error = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.errors = error;
    Error.captureStackTrace(this, this.constructor);
    this.errors = error;
  }
}

export default ApiRoorError;

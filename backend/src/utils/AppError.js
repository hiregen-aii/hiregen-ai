// error
class AppError extends Error {
  constructor(msg, code = 500) {
    super(msg)
    this.statusCode = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError

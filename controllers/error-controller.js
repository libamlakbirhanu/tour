const AppError = require('../utils/app-error');

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // console.log('Error: 🤯', err);
    res.status(500).json({
      status: 'Error',
      message: 'Something went wrong',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }

  // console.log('Error: 🤯', err);
  return res.status(500).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsErrorDB = (err) => {
  const message = `Duplicate Field value: "${err.keyValue.name}"... please use another value 😅`;
  return new AppError(message, 400);
};

const handleInputValidationError = (err) => {
  const errors = err.errors.map((error) => error.msg);
  const message = `Validation Errors: [${errors.join(',\n ')}]`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Try logging in again 😊', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expired. Try logging in again 😊', 401);

const handleValidatorErrorDB = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `Invalid inputs: [${errors.join(',\n ')}]`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let errObj = { ...err };
    errObj.message = err.message;

    if (err.name === 'CastError') errObj = handleCastErrorDB(errObj);
    else if (err.code === 11000) errObj = handleDuplicateFieldsErrorDB(errObj);
    else if (err.code === 9044) errObj = handleInputValidationError(errObj);
    else if (err.name === 'ValidationError')
      errObj = handleValidatorErrorDB(errObj);
    else if (err.name === 'JsonWebTokenError') errObj = handleJWTError();
    else if (err.name === 'TokenExpiredError') errObj = handleJWTExpiredError();

    sendErrorProd(errObj, req, res);
  }
};

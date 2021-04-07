const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  if(process.env.NODE_ENV === 'DEVELOPMENT'){
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack
    });
  };

/////////////////////////Production//////////////////////////////////////////////
  if(process.env.NODE_ENV === 'PRODUCTION'){
    let error = {...err};  

    error.message = err.message;

    // wrong ID
        if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`
        error = new ErrorHandler(message, 400)
      }

      // handle duplicate key
      if(err.code === 111000 ){
        const message = `Duplicate ${object.keys(err.keyValue)} entered`
        error = new ErrorHandler(message, 400) 
      }

      // jwt error 
      if (err.name === 'JsonWebTokenError') {
        const message = 'Json Token is invalid'
        error = new ErrorHandler(message, 400)
      }
      
      // expired token
      if (err.name === 'TokenExpiredError') {
        const message = 'Json Token is expired'
        error = new ErrorHandler(message, 400)
      }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || 'internal server error'
    });
  };
};
const User = require('../models/user');

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

const jwt = require('jsonwebtoken');
const user = require("../models/user");

// check if user is Authenticated
exports.isUserAuthenticated = catchAsyncErrors(async(req, res, next) => {

  // get token from cookie assigned at 
  const { token } = req.cookies;

  // check is token exists
  if(!token){
    return next(new ErrorHandler('Login required'), 401)
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await user.findById(decoded.id);
  next();
});

// Handle user roles 
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      console.log(req.user.role)
      return next( new ErrorHandler(`Role (${req.user.role}) access not granted`, 403));
    }
    next();
  }
}
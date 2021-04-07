const User = require('../models/user');

// error handlers (for when it goes wrong)
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleWares/catchAsyncErrors');

// Token and cookie setter (utils folder)
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');
const cloudinary = require('cloudinary');

// register user  /register
exports.registerUser = catchAsyncErrors( async(req, res, next) => {

  // save data to cloudinary server
  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: 'avatars',
    width: 150,
    crop: 'scale'
  })

  // get details from body
  const {name, email, password} = req.body;

  // create user
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url
     }
  });

  //create token set in cookies 
  sendToken(user, 200, res);
});

// get user profile  /me 
exports.getUserProfile = catchAsyncErrors( async(req, res, next) => {
  // find by id this is stored in req.user
  const user = await User.findById(req.user.id);

  // return user profile
  res.status(200).json({
    success: true,
    user
  })
});

// update user profile /me/update
exports.updateProfile = catchAsyncErrors( async(req, res, next) => {
  // store new data
  const newUserData = { 
    name: req.body.name,
    email: req.body.email
  }

    // Update avatar
    if (req.body.avatar !== '') {
      const user = await User.findById(req.user.id)

      const image_id = user.avatar.public_id;
      const res = await cloudinary.v2.uploader.destroy(image_id);

      const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: 'avatars',
          width: 150,
          crop: "scale"
      })

      newUserData.avatar = {
          public_id: result.public_id,
          url: result.secure_url
      }
  }

  // find user then update with new data
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true
  })
})

// update users password  password/update
exports.updatePassword = catchAsyncErrors( async(req, res, next) => {
  // find user
  const user = await User.findById(req.user.id).select('+password');

  // compare old password
  const isMatch = await user.comparePassword(req.body.oldpassword);

  // check is match
  if(!isMatch){
    return new ErrorHandler('old password is incorrect', 400)
  }

  // set new password
  user.password = req.body.password;
  user.save();
  sendToken(user, 200, res);
})

// login user /login
exports.loginUser = catchAsyncErrors( async(req, res, next) => {
  // details from body
  const {email, password} = req.body;

  // check email and password is provided
  if(!email || !password){
    return next(new ErrorHandler('email & password required', 400))
  };

  // find user
  const user = await User.findOne({ email }).select('+password');

  // check user is valid
  if(!user){
    return next(new ErrorHandler('invalid email or password', 401));
  };

  // compare the password (user model method)
  const isPasswordMatch = await user.comparePassword(password);
  console.log(isPasswordMatch)

  if(!isPasswordMatch){
    return next(new ErrorHandler('invalid password', 401))
  };

   //create token set in cookies 
  sendToken(user, 200, res);

});

// logout user /logout
exports.logOutUser = catchAsyncErrors(async(req, res, next) => {
  // clear cookie
  res.cookie('token', null,{
    expires: new Date(Date.now()),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'logged out see ya'
  });
});

// forgot password /password/forgot
exports.forgotPassword = catchAsyncErrors( async(req, res, next) => {
  // find user
  const user = await User.findOne( {email: req.body.email} );

  // check is user exists
  if(!user){
    return next(new ErrorHandler('cannot find email'), 404)
  }

  // access getResetPasswordToken method 
  const resetToken = user.getResetPasswordToken();

  await user.save({validateBeforeSave: false});

    // create reset pass url for email
  const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

      try {
        await sendEmail({
          email: user.email,
          subject: 'password reset',
          message
        })

        res.status(200).json({
          success: true,
          message: `email sent ${user.email}`
        })

      } catch (error) {
        user.resetPasswordToken = undefined,
        user.resetPasswordExpire= undefined
        await user.save({validateBeforeSave: false})
        return next(ErrorHandler(error.message, 500))
      }
})

// reset users password (link in email) api/v1/password/reset/:token
exports.passwordReset = catchAsyncErrors( async(req, res, next) => {

  //  hash url token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  //find user with same hashed token on db
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  // check token
  if(!user){
    return next(new ErrorHandler('token is invalid or expirded', 400))
  }

  // check passwords match
  if(req.body.password !== req.body.confirmPassword){
    return next(new ErrorHandler('password does not match', 400))
  }

  // set new password and reset token options
  user.password = req.body.password
  user.resetPasswordToken = undefined,
  user.resetPasswordExpire= undefined

  await user.save();

  sendToken(user, 200, res)
})


//////////ADMIN///////// 

// READ: get all users  admin/users (role: admin)
exports.allUsers = catchAsyncErrors( async(req, res, next) => {
  // find all users
  const users = await User.find();
 
  res.status(200).json({
    success: true,
    users
  })
})

// READ: get user by id  admin/user/id
exports.getUserDetails = catchAsyncErrors( async(req, res, next) => {
  // find user by id
  const user = await User.findById(req.params.id);

  if(!user){
    return next(new ErrorHandler(`User with id of ${req.params.id}`), 400);
  }

  res.status(200).json({
    success: true,
    user 
  })
})

// UPDATE: profile - user admin/user/:id
exports.updateUser = catchAsyncErrors( async(req, res, next) => {
  // store new data
  const newUserData = { 
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }

  // find user then update with new data
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true
  })
})

// DELETE: user - admin/user/:id
exports.deletUser = catchAsyncErrors( async(req, res, next) => {
  // find user by id
  const user = await User.findById(req.params.id);

  if(!user){
    return next(new ErrorHandler(`User with id of ${req.params.id}`), 400);
  }

  // remove user 
  await user.remove()

  res.status(200).json({
    success: true,
    user 
  })
})
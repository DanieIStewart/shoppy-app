const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
 name:{
   type: String,
   required: [true, 'please enter your name'],
   maxLength: [30, 'no more than 30 characters']
 },
 email:{
   type: String,
   required: [true, 'Please enter email'],
   unique: true,
   validate: [validator.isEmail, 'enter valid email']
 },
 password:{
   type: String,
   required: [true, 'Please enter password'],
   maxlength: [10, 'Password must be longer than 4 characters'],
   select: false,
 },
 avatar:{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
    },
    role: {
      type: String,
      default: 'user'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// encypt password before saving
userSchema.pre('save', async function(next){
  
  if(!this.isModified('password')){
    next();
  }
  // if changed excrypt it
  this.password = await bcrypt.hash(this.password, 10);
});

// compare user password with db
userSchema.methods.comparePassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password );
};

// Create Token for user
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME
  });
};

// password reset token
userSchema.methods.getResetPasswordToken = function() {
  console.log('running')
  // generate token
  const token = crypto.randomBytes(20).toString('hex');
  // hash token  db ref
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  // token expire 30 minutes
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return token;
}

module.exports = mongoose.model('User', userSchema);
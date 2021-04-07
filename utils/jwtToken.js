// create a token and save in cookie
const sendToken = (user, statusCode, res) => {

  // create Token (method user model)
  const token = user.getJwtToken();

  // options for cookie
  const options = {
    expired: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME *24 * 60 * 60 * 1000
    ),
    // httpOnly security as without can be accessed directly with js
    httpOnly: true
  }

  // return user and cookie
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user
  })

}

module.exports = sendToken;
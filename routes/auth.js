const express = require('express');
const router = express.Router();

// functions from Controllers
const { 
  registerUser, 
  loginUser, 
  logOutUser,
  forgotPassword,
  passwordReset,
  updatePassword,
  updateProfile,
  getUserProfile, 
  allUsers,
  getUserDetails,
  updateUser,
  deletUser } = require('../controllers/userController')

 // middlewares
const { isUserAuthenticated, authorizeRoles } = require('../middleWares/auth');

// AUTHENTICATION Routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logOutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(passwordReset);

// USER routes  check user is loggin before getting profile
router.route('/me').get(isUserAuthenticated, getUserProfile);
router.route('/password/update').put(isUserAuthenticated, updatePassword);
router.route('/me/update').put(isUserAuthenticated, updateProfile);

// ADMIN routes 2 middlewares
router.route('/admin/users').get(isUserAuthenticated, authorizeRoles('admin'), allUsers);
router.route('/admin/user/:id')
  .get(isUserAuthenticated, authorizeRoles('admin'), getUserDetails)
  .put(isUserAuthenticated, authorizeRoles('admin'), updateUser)
  .delete(isUserAuthenticated, authorizeRoles('admin'), deletUser)

module.exports = router;
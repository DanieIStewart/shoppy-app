const express = require('express');
const router = express.Router();

// functions from Controller;
const { 
  newOrder,
  getSingleOrder,
  getMyOrders,
  allOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

// Middlewares
const { isUserAuthenticated, authorizeRoles } = require('../middleWares/auth');

// Routes 

// CREATE:  new order  /order/new
router.route('/order/new').post(isUserAuthenticated, newOrder);
// READ: Get single order /:id
router.route('/order/:id').get(isUserAuthenticated, getSingleOrder);
// READ: Get logged in user orders
router.route('/orders/me').get(isUserAuthenticated, getMyOrders);
// READ: Get all orders/ (ADMIN)
router.route('admin/orders/').get(isUserAuthenticated, authorizeRoles('admin'), allOrders);
// UPDATE:  orders processed/time/date  (ADMIN)
router.route('admin/orders/:id').put(isUserAuthenticated, authorizeRoles('admin'), updateOrder);
// DELETE:  Delete single order  (ADMIN)
router.route('admin/order/:id').delete(isUserAuthenticated, authorizeRoles('admin'), deleteOrder);

module.exports = router;
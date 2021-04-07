const Order = require('../models/order'); //Order shcema
const Product = require('../models/product'); //Product shcema

// Middlewares
const ErrorHandler = require('../utils/errorHandler') //Handles Express errors
const catchAsyncErrors = require('../middleWares/catchAsyncErrors'); //Handles Async errors

////////// Routes //////////////

// CREATE: New order -- /order/new
exports.newOrder = catchAsyncErrors( async(req, res, next) => {
  //get all oder information from req.body
  const {
    orderItems,
    shippingInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo
  } = req.body;

  // create order with schema
  const order = await new order.create({
    orderItems,
    shippingInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id
  });

  res.status(200).json({
    success: true,
    order
  });
});

// GET: Single order  - order/:id
exports.getSingleOrder = catchAsyncErrors( async(req, res, next) => {
  //find order using id in body
  const order =  await Order.findById(req.params.id).populate('user', 'name email');

  if(!order){
    return next(new ErrorHandler('no order found with that id', 404)); 
  };

  res.status(200).json({
    success: true,
    order
  });

});

// GET: Logged in user order orders/me
exports.getMyOrders = catchAsyncErrors( async(req, res, next) => {
  // find all users orders
  const orders =  await Order.find({user: req.user.id});

  res.status(200).json({
    success: true,
    orders
  });
});

// GET: all orders (ADMIN)  admin/orders
exports.allOrders = catchAsyncErrors( async(req, res, next) => {
  // find all users orders
  const orders =  await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  })

  res.status(200).json({
    success: true,
    totalAmount,
    orders
  });
});

// UPDATE: process order   admin/order/:id
exports.updateOrder = catchAsyncErrors( async(req, res, next) => {
  // find order by id
  const order =  await Order.findById(req.params.id);

  if(order.orderStatus === 'Delivered'){
    return next(new ErrorHandler('Order already delivered', 400))
  };

  order.orderItems.forEach( async(item) => {
    await updateStock(item.product, item.quantity);
  });

  order.orderStatus = req.body.status;
  order.deliveryDate = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
  });
});

// DELETE: Single order  - admin/order/:id
exports.deleteOrder = catchAsyncErrors( async(req, res, next) => {
  //find order using id in body
  const order =  await Order.findById(req.params.id);

  if(!order){
    return next(new ErrorHandler('no order found with that id', 404)); 
  };

  // Delete order
  await order.remove();

  res.status(200).json({
    success: true,
    message: 'order deleted'
  });
});

async function updateStock(id, quantity){
  const product = await Product.findById(id);
  product.stock = product.stock - quantity;
  await product.save({validateBeforeSave: false});
}


const mongoose = require('mongoose');

// schema for all orders
const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      require: true
    },
    city: {
      type: String,
      require: true
    },
    phone: {
      type: String,
      require: true
    },
    postCode: {
      type: String,
      require: true
    },
    country: {
      type: String,
      require: true
    },
  },
    // connect to user making the order
    user:{
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'User'
    },
    orderItems: [
      {
        name:{
          type: String,
          require: true
        },
        quantity:{
          type: Number,
          require: true
        },
        image:{
          type: Number,
          require: true
        },
        price:{
          type: Number,
          require: true
        },
        // connect product to order
        product:{
          type: mongoose.Schema.Types.ObjectId,
          require: true,
          ref: 'Product'
        },
      }
    ],
    // STRIPE provides id/status
    paymentInfo: {
      id:{
        type: String
      },
      status:{
        type: String
      }
    },
    paidAt: {
      type: Date
    },
    itemsPrice: {
      type: Number,
      require: true,
      default: 0.0
    },
    taxPrice:{
      type: Number,
      require: true,
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      require: true,
      default: 0.0
    },
    totalPrice: {
      type: Number,
      require: true,
      default: 0.0
    },
    orderStatus: {
      type: String,
      require: true,
      default: 'Processing'
    },
    deliveryDate:{
      type: Date 
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
})

module.exports = mongoose.model('Order', orderSchema);
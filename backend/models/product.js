const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:{
    type: String,
    require: [true, 'enter product name'],
    trim: true,
    maxLength: [100, 'cannot be more than 100 letters']
  },
  price:{
    type: Number,
    require: [true, 'enter product price'],
    maxLength: [5, 'price cannot be higher than 5'],
    default: 0.0
  },
  description:{
    type: String,
    require: [true, 'enter product description'],
  },
  ratings:{
    type: Number,
    default: 0
  },
  images: [
    {
      public_id:{
        type: String,
        required: true
      },
      url:{
        type: String,
        required: true
      }
    }
  ],
  category:{
    type: String,
    required: [true, 'select category'],
    enum: {
      values: [
        'Electronics',
        'Cameras',
        'Laptops',
        'Accessories',
        'Headphones',
        'Food',
        "Books",
        'Clothes/Shoes',
        'Beauty/Health',
        'Sports',
        'Outdoor',
        'Home'
    ],
      message: 'please select category'
    }
  },
  seller: {
    type: String,
    required: [true, 'please enter seller']
  },
  stock: {
    type: Number,
    required: [true, 'enter product quantity'],
    maxLength: [5, 'no more than 5'],
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('product', productSchema);
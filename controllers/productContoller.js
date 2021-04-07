const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleWares/catchAsyncErrors');
const APIFEeatures = require('../utils/apiFeatures');
const product = require('../models/product');
const { query } = require('express');


// GET all products  /products
exports.getProducts = catchAsyncErrors(async(req, res, next) => {
  const restPerPage = 8;
  const  productsCount = await Product.countDocuments();
  console.log(productsCount)

  const apiFeatures = new APIFEeatures(Product.find(), req.query)
                      .search()
                      .filter()
                      .pagination(restPerPage)

  const products = await apiFeatures.query

  res.status(200).json({
    success: true,
    message: 'this will show all products',
    productsCount,
    restPerPage,
    products
  });
});

// Create product  ---- /product/new
exports.newProduct = catchAsyncErrors(async(req, res, next) => {
  req.body.user = req.user.id;
  
  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product
  });
});

// GET single product using ID /products/:id
exports.getSingleProduct = catchAsyncErrors(async(req, res, next) => {
  // check db for product with id
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new errorHandler('product not found'), 404);
  } 

  res.status(200).json({
    success: true,
    message: 'product Found',
    product
  });
});

// update product by ID /products/:id
exports.updateProduct = catchAsyncErrors(async(req, res, next) => {
  // check db for product with id
  let product = await Product.findById(req.params.id);
  // check if it exists
  if (!product) {
    res.status(404).json({
      success: false,
      message: 'cannot update no product',
    });
  };

  // update product with new data
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });
  // send new data
  res.status(200).json({
    success: true,
    product
  });
});

// delete product by ID /products/:id 
exports.deleteProduct = catchAsyncErrors(async(req, res, next) => {
  // find product
  const product = await Product.findById(req.params.id);

  if(!product){
   return res.status(404).json({
      success: false,
      message: 'No products found'
    });
  };
  // remove
  await product.remove();

  res.status(200).json({
    success: true,
    message: 'product deleted'
  });
});

/////////////////////////////// REVIEWS/////////////////
// CREATE: a review;  /review
exports.createReview = catchAsyncErrors(async(req, res, next) => {
  const {rating, comment, productId} = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment: comment
  };

  // find product
  const product = await Product.findById(productId);

  // check if user review already exists
  const isReviewed = product.reviews.find((review) => {
    review.user.toString() === req.user._id.toString()
  });

  if(isReviewed){
  //  update existing reviev
    product.reviews.forEach((review) => {
      if(review.user.toString() === req.user.toString()){
        review.comment = comment;
        review.rating = rating;
      };
    });
    
  }else{
  // create new review push into array/update number of reviews
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  };

  // calcaulate rating using reduce() method
  product.ratings = product.reviews.reduce((acc, item) => {
    item.rating + acc;
  },0) / product.reviews.length;

  // save the product
 await product.save({validateBeforeSave: false});

 res.status(200).json({
   success: true
 })
});

// GET all product reviews /reviews
exports.getReviews = catchAsyncErrors(async(req, res, next) => {
  // find all reviews for product 
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews
  });
});

//DELETE review 
exports.deleteReview = catchAsyncErrors(async(req, res, next) => {
   // find all product
   const product = await Product.findById(req,query.productId);

  // store all other reviews
   const reviews = product.reviews.filter((review) => {
    review._id.toString() !== req.query.id.toString;
   });

   const numOfReviews = reviews.length;

  // calcaulate rating using reduce() method
  const ratings =  product.reviews.reduce((acc, item) => {
    item.rating + acc;
  },0) / reviews.length;
  
  // update product with new data
  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    ratings,
    numOfReviews
  },{
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
  })
})
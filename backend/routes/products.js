const express = require('express');
const router = express.Router();

// functions for crud operations from Controllers
const { 
    getProducts, 
    newProduct, 
    getSingleProduct, 
    updateProduct,
    deleteProduct,
    createReview,
    getReviews,
    deleteReview
  } = require('../controllers/productContoller');

  // check if user is authenticated
const { isUserAuthenticated, authorizeRoles } = require('../middleWares/auth'); 

// return all products
router.route('/products').get(getProducts);
// new product  //protected route: ADMINS
router.route('/admin/product/new').post(isUserAuthenticated, authorizeRoles('admin', 'user'), newProduct);
// find single product *isUserAuthenticated* removed
router.route('/product/:id').get( getSingleProduct);
// update product //Admin
router.route('/admin/product/:id').put(isUserAuthenticated, authorizeRoles('admin'), updateProduct);
// update product //Admin
router.route('/admin/product/:id').delete(isUserAuthenticated, authorizeRoles('admin'), deleteProduct);

////// REVIEWS ////
// CREATE: review
router.route('/review').put(isUserAuthenticated, createReview);
// GET: review
router.route('/review').get(isUserAuthenticated, getReviews);
// DELETE: review
router.route('/review').delete(isUserAuthenticated, deleteReview);



module.exports = router;
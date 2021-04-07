// import product model
const Product = require('../models/product');
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');

// currently locally stored products
const products = require('../data/product.json');
const product = require('../models/product');

// connect to database
dotenv.config({ path: 'backend/config/config.env' })

connectDatabase();

const seedProducts = async() => {
  try {
    // remove from db
    await Product.deleteMany();
    console.log('all products removed')
    // add to db
    await product.insertMany(products)
    console.log('all products added')

    process.exit()
  } catch (error) {
    console.log(error.message);
    process.exit()
  }
}

seedProducts()
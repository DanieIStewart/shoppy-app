const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const bodyparser = require('body-parser'); // parse body
const fileUpload = require('express-fileupload');

// middleware
const errorMiddleware = require('./middleWares/error');

app.use(express.json());
app.use(bodyparser.urlencoded({extended: true }));
app.use(cookieParser());
app.use(fileUpload());


// import routes
const products = require('./routes/products');
const auth = require('./routes/auth');
const order = require('./routes/order');

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);

app.use(errorMiddleware);

module.exports = app;
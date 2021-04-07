const app = require('./app');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary'); // online content hosting

const dotenv = require('dotenv');

// uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`ERROR:  ${err.message}`);
  console.log('server closing');
  process.exit(1);
});

// Setting up config
dotenv.config({path: 'backend/config/config.env'});

// connecting datase
connectDatabase();


// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


const server = app.listen(process.env.PORT, () => {
  console.log(`server started on port ${process.env.PORT} in ${process.env.NODE_ENV}`);
});

// handle promise rejections
process.on('unhandledRejection', err => {
  console.log(`ERROR: ${err.message}`);
  console.log(`Server Closing`);
  server.close(() => {
    process.exit(1);
  });
});
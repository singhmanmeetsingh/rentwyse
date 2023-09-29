const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport-config'); // Import the Passport configuration
const { hashPassword } = require('./config/bcrypt-config'); 

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

// port 
app.set('port', process.env.PORT);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// path for all the css imports
app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

//controlles

const testController = require('./controllers/testController');

//routes
app.get('/', testController.index)


/**
 * Connect to MongoDB.
//  */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});


app.listen(app.get('port'), () => {
  console.log(`App is running on http://localhost:${app.get('port')} in ${app.get('env')} mode`);
  console.log('Press CTRL-C to stop');
});
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport-config'); // Import the Passport configuration
const { hashPassword } = require('./config/bcrypt-config'); 
const { check, validationResult } = require('express-validator');
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });
//body-parser
app.use(bodyParser.json());

// port 
app.set('port', process.env.PORT);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// path for all the css imports
app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

//passport and sessions

app.use(
  session({
    secret: 'your-secret-key', // Change this to a strong, unique secret key
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//controlles

const testController = require('./controllers/testController');
const userController = require('./controllers/userController');

//routes
app.get('/', testController.index);

app.post('/register',
[
    check('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    check('email')
      .isEmail()
      .withMessage('Invalid email address'),
  ], userController.postRegister);


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
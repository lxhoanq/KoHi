global.isObject = (obj) => {
  if (obj.constructor.name === 'Object') {
    return true;
  }
  return false;
};
  
const config = require('./config');
const mongoose = require('mongoose');

// mongoose.Promise = require('bluebird');
mongoose.Promise = global.Promise;

const connection =
  mongoose.connect(config.database.connection, config.database.option);

require('./modules/auto-increment').init(connection);
 
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const logger = require('morgan');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const passUserToViews = require('./middleware/passUserToViews');


const app = express();

//const upload = multer({ dest: '/public/uploads/' })
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passUserToViews);
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    const namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(
  session(
    {
      secret: config.session.key,
      resave: false,
      key: 'user',
      saveUninitialized: true,
      cookie: { secure: false }
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

function reassignUserSession(req, res, next) {
  if (req.session.user) {
    req.user = req.session.user;
  }
  next();
}

// Use the reassignUserSession middleware
app.use(reassignUserSession);

app.use(flash());

app.use((req, res, next) => {
  res.locals.response_message = req.flash('response_message');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', require('./routes/index'));
app.use('/', require('./routes/user'));
app.use('/category1', require('./routes/category'));
app.use('/', require('./routes/category'));
app.use('/product_type', require('./routes/product_type'));
app.use('/', require('./routes/product_type'));
app.use('/', require('./routes/admin'));
app.use('/', require('./routes/oder'));
app.use('/', require('./routes/color'));
app.use('/', require('./routes/product'));
app.use('/', require('./routes/product_photo'));
app.use('/', require('./routes/product_size'));
app.use('/', require('./routes/cart'));
app.use('/', require('./routes/delivery'));
app.use('/', require('./routes/payment'));
app.use('/', require('./routes/success'));
app.use('/', require('./routes/detail'));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404; 
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.set('port', config.app.port);

/**
 * Create HTTP server.
 */
const server = require('http').createServer(app);

server.listen(config.app.port);

server.on('error', (error) => {
  console.error(error);
  console.log(error);
  throw error;
});

server.on('listening', () => {
  require('debug')('shopping:server')(`Listening on ${server.address()}:${config.app.port}`);
});

app.get('/continue-shopping', (req, res) => {
  res.redirect('/');
});
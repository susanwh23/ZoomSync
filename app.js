/**
 * dotenv gives us access to private variables held in a .env file
 * never expose this .env file publicly
 */
require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { debug } = require('node:console');
const redis = require('./configs/redis');
const { tokenCheck } = require('./middlewares/tokenCheck');

var indexRouter = require('./routes/index');
var getParticipantsRouter = require('./routes/getParticipants');
var getMeetingInstancesRouter = require('./routes/getMeetingInstances');

var app = express();

/**
   * Default connection to redis - port 6379
   * See https://github.com/redis/node-redis/blob/master/docs/client-configuration.md for additional config objects
   */

(async () => {
  await redis.connect();
})();

redis.on('connect', (err) => {
  if (err) {
    console.log('Could not establish connection with redis');
  } else {
    console.log('Connected to redis successfully');
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/getParticipants', tokenCheck, getParticipantsRouter);
app.use('/getMeetingInstances', tokenCheck, getMeetingInstancesRouter);


/**
  * Graceful shutdown, removes access_token from redis
  */
const cleanup = async () => {
  debug('\nCleaning up');
  try {
    // del access_token
    await redis.del('access_token');
    debug('Access token deleted successfully');
  } catch (error) {
    console.error('Error deleting access token:', error);
  }
  debug('\n Redis Connection closed');
  redis.quit();
  process.exit();
  
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;

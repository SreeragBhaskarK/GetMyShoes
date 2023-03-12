var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
/* ejs view engine layout  */
var expressLayouts = require('express-ejs-layouts');
/* mongodb */
require('./config/connection')
var bodyParser = express.json
var cor = require("cors")


var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
/* ejs layout path set */
app.set('layout', 'layouts/layout');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/* ejs layout  */
app.use(expressLayouts);
/* db.connect((err) => {
  if (err)
    console.log("Connection Error" + err)
  else
    console.log("Database Connected to port 27017")

}) */
app.use(cor())
app.use(bodyParser())
app.use('/admin', adminRouter);
app.use('/', usersRouter);

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

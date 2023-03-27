var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
/* ejs view engine layout  */
var expressLayouts = require('express-ejs-layouts');
/* mongodb */
require('./server/config/connection')
var bodyParser = express.json
var cor = require("cors")
const nocache = require("nocache");
const sessions = require('express-session');




var adminRouter = require('./routes/adminRouters');
var usersRouter = require('./routes/usersRouters');
var productsRouter = require('./routes/productRouters');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
/* ejs layout path set */
app.set('layout', 'layouts/layout');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use(nocache());
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  cookie: { maxAge: oneDay },
  resave: false
}));
app.use(cor())
app.use(bodyParser())
app.use('/admin', adminRouter);
app.use('/', usersRouter);
app.use('/', productsRouter);


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

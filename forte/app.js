'use strict';

const {
  join
} = require('path');
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const serveFavicon = require('serve-favicon');

const indexRouter = require('./routes/index');
const companyRouter = require('./routes/company');
const authetication = require('./routes/authentication');
const invoices = require('./routes/invoices');
const users = require('./routes/users');

const mongoose = require('mongoose');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(expressSession);
const Company = require('./models/company');
const User = require('./models/user');

const hbs = require("hbs");
const app = express();
mongoose.set('useFindAndModify', false); //needed to do FindOneAndUpdate


app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));
app.use(express.static(join(__dirname, 'public')));
hbs.registerPartials(__dirname + "/views/partials");
hbs.registerHelper('date', value => {
  return value.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
});


app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 15, //15 days
      secure: process.env.NODE_ENV !== 'development',
      sameSite: true,
      httpOnly: false
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60 * 24 //one full day
    })
  })
);

app.use((req, res, next) => {
  // console.log('im running!')
  const userId = req.session.user;
  //console.log('session check, company ID: ', companyId);
  if (userId) {
    User.findById(userId)
      .then(signedUser => {
        // console.log('logged in user is', signedCompany);
        req.user = signedUser;
        res.locals.user = req.user;
        next();
      })
      .catch(error => {
        next(error);
      });
  } else {
    next();
  }

});

app.use('/', authetication);
app.use('/', invoices);
app.use('/', companyRouter);
app.use('/', users);
app.use('/', indexRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;
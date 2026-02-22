require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan'); 
const handlebars = require('hbs');
const passport = require('passport'); // Import passport

// 1. Bring in the database and passport config
require('./app_api/models/db');
require('./app_api/config/passport');

const indexRouter = require('./app_server/routes/index');
const usersRouter = require('./app_server/routes/users');
const travelRouter = require('./app_server/routes/travel');
const apiRouter = require('./app_api/routes/index');

const app = express(); // Initialize app BEFORE using it

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');
handlebars.registerPartials(__dirname + '/app_server/views/partials');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 2. Initialize Passport
app.use(passport.initialize());

// 3. Enable CORS
app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // Added Authorization
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// 4. Wire-up routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
app.use('/api', apiRouter);

// 5. Catch unauthorized errors (JWT failures)
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({"message": err.name + ": " + err.message});
    }
});

// 6. catch 404
app.use(function(req, res, next) {
    const createError = require('http-errors');
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
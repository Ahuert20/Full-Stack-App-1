/**
 * Travlr Getaways Main Application
 * Updated for Module 5 with mongo sanitize security middleware
 * 
 * @module app
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const handlebars = require('hbs');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');

// Database and passport configuration
require('./app_api/models/db');
require('./app_api/config/passport');

// Route imports
const indexRouter = require('./app_server/routes/index');
const usersRouter = require('./app_server/routes/users');
const travelRouter = require('./app_server/routes/travel');
const apiRouter = require('./app_api/routes/index');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');
handlebars.registerPartials(__dirname + '/app_server/views/partials');

// Middleware stack
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Security: Strip MongoDB operators from user input
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized potentially malicious data in ${key}`);
    }
}));

// Initialize Passport
app.use(passport.initialize());

// Enable CORS for Angular admin panel
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Wire up routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
app.use('/api', apiRouter);

// Catch unauthorized errors
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            message: err.name + ": " + err.message
        });
    } else {
        next(err);
    }
});

// Catch 404
app.use(function(req, res, next) {
    const createError = require('http-errors');
    next(createError(404));
});

// Generic error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
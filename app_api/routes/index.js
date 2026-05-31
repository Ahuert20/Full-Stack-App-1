/**
 * API Routes
 * Defines all API endpoints and applies validation middleware
 * 
 * @module routes/index
 */

const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

const tripsController = require("../controllers/trips");
const authController = require("../controllers/authentication");
const bookingsController = require("../controllers/bookings");
const validation = require("../middleware/validation");

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded user data to req.auth
 */
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log('Authorization header missing');
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        console.log('Bearer token missing');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            console.log('Token validation error');
            return res.sendStatus(403);
        }

        req.auth = verified;
        next();
    });
}

// Authentication routes
router.post('/login', validation.validateLogin, authController.login);
router.post('/register', validation.validateRegister, authController.register);

// Search routes - placed before /trips to avoid route conflicts
router.get('/search', validation.validateSearchQuery, tripsController.tripsSearch);
router.get('/search/stats', tripsController.tripsSearchStats);

// Trip routes
router.route("/trips")
    .get(validation.validateTripQuery, tripsController.tripsList)
    .post(authenticateJWT, validation.validateTripCreate, tripsController.tripsAddTrip);

router.route('/trips/:tripCode')
    .get(validation.validateTripCode, tripsController.tripsFindByCode)
    .put(authenticateJWT, validation.validateTripCode, validation.validateTripUpdate, tripsController.tripsUpdateTrip)
    .delete(authenticateJWT, validation.validateTripCode, tripsController.tripsDeleteTrip);

// Booking routes
router.post(
    '/trips/:tripId/book',
    authenticateJWT,
    validation.validateTripId,
    bookingsController.bookTrip
);

router.get(
    '/my-trips',
    authenticateJWT,
    bookingsController.getMyTrips
);

module.exports = router;
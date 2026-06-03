/**
 * API Routes - Updated for Module 5
 * Added review routes and booking cancellation
 * Review/stats routes placed before /:tripCode to avoid route conflicts
 * 
 * @module routes/index
 */

const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

const tripsController = require("../controllers/trips");
const authController = require("../controllers/authentication");
const bookingsController = require("../controllers/bookings");
const reviewsController = require("../controllers/reviews");
const validation = require("../middleware/validation");

/**
 * JWT Authentication Middleware
 */
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.auth = verified;
        next();
    });
}

// Authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Popular trips - must be before /:tripCode to avoid conflict
router.get('/trips/popular', reviewsController.getPopularTrips);

// Review and stats routes - MUST be before /:tripCode route
router.post(
    '/trips/:tripId/reviews',
    authenticateJWT,
    reviewsController.createReview
);

router.get(
    '/trips/:tripId/reviews',
    reviewsController.getTripReviews
);

router.get(
    '/trips/:tripId/stats',
    reviewsController.getTripStats
);

// Booking routes - also before /:tripCode
router.post(
    '/trips/:tripId/book',
    authenticateJWT,
    bookingsController.bookTrip
);

// Trip CRUD routes
router.route("/trips")
    .get(tripsController.tripsList)
    .post(authenticateJWT, tripsController.tripsAddTrip);

router.route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip)
    .delete(authenticateJWT, tripsController.tripsDeleteTrip);

// My trips and cancel booking
router.get(
    '/my-trips',
    authenticateJWT,
    bookingsController.getMyTrips
);

router.put(
    '/bookings/:bookingId/cancel',
    authenticateJWT,
    bookingsController.cancelBooking
);

module.exports = router;
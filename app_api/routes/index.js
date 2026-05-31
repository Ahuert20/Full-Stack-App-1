const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

const tripsController = require("../controllers/trips");
const authController = require("../controllers/authentication");
const bookingsController = require("../controllers/bookings");


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

        req.auth = verified; // attach decoded payload
        next();
    });
}


router.post('/login', authController.login);
router.post('/register', authController.register);



router.route("/trips")
    .get(tripsController.tripsList)
    .post(authenticateJWT, tripsController.tripsAddTrip);

router.route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip)
    .delete(authenticateJWT, tripsController.tripsDeleteTrip);


// Book a trip (must be logged in)
router.post(
    '/trips/:tripId/book',
    authenticateJWT,
    bookingsController.bookTrip
);

// Get logged-in user's booked trips (Itinerary)
router.get(
    '/my-trips',
    authenticateJWT,
    bookingsController.getMyTrips
);


module.exports = router;
/**
 * Bookings Controller
 * Handles HTTP requests and responses for booking endpoints
 * Delegates business logic to bookingService
 * 
 * @module controllers/bookings
 */

const bookingService = require('../services/bookingService');

/**
 * POST: /api/trips/:tripId/book - Book a trip for the authenticated user
 * @param {Object} req - Express request object (must contain req.auth._id from JWT)
 * @param {Object} res - Express response object
 */
const bookTrip = async (req, res) => {
    try {
        const userId = req.auth._id;
        const tripId = req.params.tripId;

        await bookingService.bookTrip(userId, tripId);

        res.status(200).json({ 
            message: 'Trip booked successfully' 
        });

    } catch (err) {
        console.error('Error in bookTrip:', err);
        res.status(err.status || 500).json({ 
            message: err.message || 'Internal server error' 
        });
    }
};

/**
 * GET: /api/my-trips - Get all booked trips for the authenticated user
 * @param {Object} req - Express request object (must contain req.auth._id from JWT)
 * @param {Object} res - Express response object
 */
const getMyTrips = async (req, res) => {
    try {
        const userId = req.auth._id;
        const bookings = await bookingService.getUserBookings(userId);

        res.status(200).json(bookings);

    } catch (err) {
        console.error('Error in getMyTrips:', err);
        res.status(err.status || 500).json({ 
            message: err.message || 'Internal server error' 
        });
    }
};

module.exports = {
    bookTrip,
    getMyTrips
};
/**
 * Bookings Controller - Enhanced for Module 5
 * Handles HTTP requests for booking endpoints
 * Delegates all business logic to bookingService
 * 
 * @module controllers/bookings
 */

const bookingService = require('../services/bookingService');

/**
 * POST: /api/trips/:tripId/book - Book a trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bookTrip = async (req, res) => {
    try {
        const userId = req.auth._id;
        const tripId = req.params.tripId;
        const guests = parseInt(req.body.guests) || 1;

        const booking = await bookingService.bookTrip(userId, tripId, guests);

        res.status(201).json({
            message: 'Trip booked successfully',
            booking
        });

    } catch (err) {
        console.error('Error in bookTrip:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * GET: /api/my-trips - Get all bookings for the logged in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyTrips = async (req, res) => {
    try {
        const bookings = await bookingService.getUserBookings(req.auth._id);
        res.status(200).json(bookings);

    } catch (err) {
        console.error('Error in getMyTrips:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * PUT: /api/bookings/:bookingId/cancel - Cancel a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelBooking = async (req, res) => {
    try {
        const booking = await bookingService.cancelBooking(
            req.params.bookingId,
            req.auth._id
        );

        res.status(200).json({
            message: 'Booking cancelled successfully',
            booking
        });

    } catch (err) {
        console.error('Error in cancelBooking:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = {
    bookTrip,
    getMyTrips,
    cancelBooking
};
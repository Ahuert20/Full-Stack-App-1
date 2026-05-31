/**
 * Booking Service
 * Handles all business logic for booking operations
 * Manages user trip bookings and itinerary
 * 
 * @module services/bookingService
 */

const User = require('../models/user');
const Trip = require('../models/travlr');
const mongoose = require('mongoose');

/**
 * Book a trip for a user
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} tripId - Trip's MongoDB ObjectId
 * @returns {Promise<Object>} Updated user object with booking
 * @throws {Error} If user not found, trip not found, already booked, or database operation fails
 */
const bookTrip = async (userId, tripId) => {
    try {
        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const error = new Error('Invalid user ID');
            error.status = 400;
            throw error;
        }

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            const error = new Error('Invalid trip ID');
            error.status = 400;
            throw error;
        }

        // Find user and trip
        const user = await User.findById(userId).exec();
        const trip = await Trip.findById(tripId).exec();

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        if (!trip) {
            const error = new Error('Trip not found');
            error.status = 404;
            throw error;
        }

        // Check if trip already booked
        const alreadyBooked = user.bookings.some(
            booking => booking.toString() === tripId
        );

        if (alreadyBooked) {
            const error = new Error('Trip already booked');
            error.status = 400;
            throw error;
        }

        // Add trip to user's bookings
        user.bookings.push(trip._id);
        await user.save();

        return user;

    } catch (err) {
        throw err;
    }
};

/**
 * Get all booked trips for a user
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {Promise<Array>} Array of booked trip objects
 * @throws {Error} If user not found or database query fails
 */
const getUserBookings = async (userId) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const error = new Error('Invalid user ID');
            error.status = 400;
            throw error;
        }

        const user = await User.findById(userId)
            .populate('bookings')
            .exec();

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        return user.bookings;

    } catch (err) {
        throw err;
    }
};

/**
 * Remove a booking from user's itinerary
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} tripId - Trip's MongoDB ObjectId
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If user not found, trip not found, or database operation fails
 */
const cancelBooking = async (userId, tripId) => {
    try {
        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const error = new Error('Invalid user ID');
            error.status = 400;
            throw error;
        }

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            const error = new Error('Invalid trip ID');
            error.status = 400;
            throw error;
        }

        const user = await User.findById(userId).exec();

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        // Remove trip from bookings
        user.bookings = user.bookings.filter(
            booking => booking.toString() !== tripId
        );

        await user.save();
        return user;

    } catch (err) {
        throw err;
    }
};

module.exports = {
    bookTrip,
    getUserBookings,
    cancelBooking
};
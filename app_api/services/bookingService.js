/**
 * Booking Service - Enhanced for Module 5
 * 
 * Handles creating and managing bookings. Originally the app just pushed
 * trip IDs into a user array with no booking details at all. This version
 * creates proper Booking documents with guests, total price, and status.
 * 
 * Note: MongoDB transactions require a replica set configuration which
 * is a production deployment concern. This implementation uses sequential
 * operations with error handling to maintain data consistency.
 * 
 * @module services/bookingService
 */

const mongoose = require('mongoose');
const User = require('../models/user');
const Trip = require('../models/travlr');
const Booking = require('../models/booking');

/**
 * Book a trip for a user
 * Creates a booking document and updates trip and user records
 * 
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} tripId - Trip's MongoDB ObjectId
 * @param {number} guests - Number of guests
 * @returns {Promise<Object>} Created booking object
 * @throws {Error} If already booked, trip not found, or save fails
 */
const bookTrip = async (userId, tripId, guests = 1) => {
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

    // Validate guests
    if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
        const error = new Error('Guests must be a whole number between 1 and 20');
        error.status = 400;
        throw error;
    }

    // Check user and trip both exist
    const [user, trip] = await Promise.all([
        User.findById(userId).exec(),
        Trip.findById(tripId).exec()
    ]);

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

    // Check if user already has an active booking for this trip
    const existingBooking = await Booking.findOne({
        user: userId,
        trip: tripId,
        status: { $ne: 'cancelled' }
    }).exec();

    if (existingBooking) {
        const error = new Error('You already have an active booking for this trip');
        error.status = 400;
        throw error;
    }

    // Calculate total price at time of booking
    // Stored on booking so price changes dont affect existing reservations
    const totalPrice = trip.perPerson * guests;

    // Create the booking document
    const newBooking = new Booking({
        user: userId,
        trip: tripId,
        guests,
        totalPrice,
        status: 'confirmed'
    });

    await newBooking.save();

    // Update trip booking count
    await Trip.findByIdAndUpdate(
        tripId,
        { $inc: { bookingCount: 1 } }
    );

    // Add booking reference to user
    await User.findByIdAndUpdate(
        userId,
        { $push: { bookings: newBooking._id } }
    );

    return newBooking;
};

/**
 * Get all bookings for a specific user with trip details
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {Promise<Array>} Array of booking objects with trip info
 * @throws {Error} If user not found or query fails
 */
const getUserBookings = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const error = new Error('Invalid user ID');
        error.status = 400;
        throw error;
    }

    const bookings = await Booking.find({ user: userId })
        .populate('trip', 'name resort start perPerson image code')
        .sort({ createdAt: -1 })
        .exec();

    return bookings;
};

/**
 * Cancel a booking
 * Updates booking status and decrements trip booking count
 * 
 * @param {string} bookingId - Booking's MongoDB ObjectId
 * @param {string} userId - User ID to verify ownership
 * @returns {Promise<Object>} Updated booking object
 * @throws {Error} If booking not found, not authorized, or already cancelled
 */
const cancelBooking = async (bookingId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        const error = new Error('Invalid booking ID');
        error.status = 400;
        throw error;
    }

    const booking = await Booking.findById(bookingId).exec();

    if (!booking) {
        const error = new Error('Booking not found');
        error.status = 404;
        throw error;
    }

    // Make sure this booking belongs to the requesting user
    if (booking.user.toString() !== userId.toString()) {
        const error = new Error('Not authorized to cancel this booking');
        error.status = 403;
        throw error;
    }

    if (booking.status === 'cancelled') {
        const error = new Error('Booking is already cancelled');
        error.status = 400;
        throw error;
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: 'cancelled' },
        { new: true }
    );

    // Decrement trip booking count
    await Trip.findByIdAndUpdate(
        booking.trip,
        { $inc: { bookingCount: -1 } }
    );

    return updatedBooking;
};

module.exports = {
    bookTrip,
    getUserBookings,
    cancelBooking
};
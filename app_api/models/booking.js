/**
 * Booking Schema
 * 
 * This schema didn't exist in the original project even though the app
 * is supposed to be a booking platform. The original just pushed trip IDs
 * into the user's bookings array with no booking details, dates, or status.
 * 
 * This version creates a proper Booking document that links users to trips
 * and tracks all the booking details needed for a real booking system.
 * 
 * @module models/booking
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Reference to the user who made the booking
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User reference is required'],
        index: true
    },

    // Reference to the trip being booked
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips',
        required: [true, 'Trip reference is required'],
        index: true
    },

    // Number of guests included in this booking
    guests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: [1, 'Must have at least 1 guest'],
        max: [20, 'Cannot book for more than 20 guests'],
        validate: {
            validator: Number.isInteger,
            message: 'Guests must be a whole number'
        }
    },

    // Total price calculated at time of booking
    // Stored here so price changes dont affect existing bookings
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative']
    },

    // Booking status tracks the lifecycle of a reservation
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'cancelled'],
            message: '{VALUE} is not a valid booking status'
        },
        default: 'confirmed'
    },

    // Optional notes from the user
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }

}, {
    timestamps: true
});

// Compound index for looking up a users bookings for a specific trip
// Also used to prevent duplicate bookings
bookingSchema.index({ user: 1, trip: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('booking', bookingSchema);
module.exports = Booking;
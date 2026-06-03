/**
 * Trip Schema - Enhanced for Module 5
 * 
 * The original schema just had basic field types with no validation rules.
 * This version adds comprehensive validation, proper data types, indexes
 * for query performance, and references to reviews.
 * @abstract
 * The biggest change is perPerson going from String to Number - the original
 * schema stored prices as strings which made price range filtering unreliable.
 * 
 * @module models/travlr
 */

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Trip code is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Trip code must be at least 3 characters'],
        maxlength: [10, 'Trip code cannot exceed 10 characters'],
        uppercase: true
    },

    name: {
        type: String,
        required: [true, 'Trip name is required'],
        trim: true,
        minlength: [3, 'Trip name must be at least 3 characters'],
        maxlength: [100, 'Trip name cannot exceed 100 characters']
    },

    length: {
        type: String,
        required: [true, 'Trip length is required'],
        trim: true,
        maxlength: [50, 'Trip length description cannot exceed 50 characters']
    },

    start: {
        type: Date,
        required: [true, 'Start date is required']
    },

    resort: {
        type: String,
        required: [true, 'Resort name is required'],
        trim: true,
        minlength: [3, 'Resort name must be at least 3 characters'],
        maxlength: [100, 'Resort name cannot exceed 100 characters']
    },

    // Changed from String to Number - was a bug in the original schema
    // Storing prices as strings made numerical filtering broken
    perPerson: {
        type: Number,
        required: [true, 'Price per person is required'],
        min: [1, 'Price must be at least $1'],
        max: [100000, 'Price cannot exceed $100,000']
    },

    image: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    },

    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    // Average rating calculated by aggregation pipeline
    // Updated whenever a review is added or removed
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    // Total number of reviews - kept in sync with Review collection
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },

    // Total number of bookings - incremented when someone books
    bookingCount: {
        type: Number,
        default: 0,
        min: 0
    }

}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// ---- Indexes for query performance ----
// Single field indexes for common lookup patterns
tripSchema.index({ resort: 1 });
tripSchema.index({ start: 1 });
tripSchema.index({ perPerson: 1 });

// Compound indexes for common filter combinations
// These match the most common query patterns in the API
tripSchema.index({ resort: 1, start: 1 });
tripSchema.index({ perPerson: 1, start: 1 });

// Text index for search functionality
// Weighted so name matches rank higher than description matches
tripSchema.index(
    { name: 'text', resort: 'text', description: 'text' },
    { weights: { name: 10, resort: 5, description: 1 } }
);

const Trip = mongoose.model('trips', tripSchema);
module.exports = Trip;
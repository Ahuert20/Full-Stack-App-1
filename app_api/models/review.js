/**
 * Review Schema
 * 
 * Another schema that was completely missing from the original project.
 * No way for users to leave ratings or feedback on trips they booked.
 * 
 * This adds a proper review system with 1-5 star ratings and text comments.
 * The unique constraint on user+trip prevents someone from reviewing
 * the same trip multiple times.
 * 
 * @module models/review
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Who wrote the review
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User reference is required'],
        index: true
    },

    // Which trip is being reviewed
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips',
        required: [true, 'Trip reference is required'],
        index: true
    },

    // Star rating 1-5
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1 star'],
        max: [5, 'Rating cannot exceed 5 stars'],
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number'
        }
    },

    // Written review text
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        minlength: [10, 'Comment must be at least 10 characters'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },

    // How many people found this review helpful
    helpfulVotes: {
        type: Number,
        default: 0,
        min: 0
    }

}, {
    timestamps: true
});

// Prevent a user from reviewing the same trip twice
reviewSchema.index({ user: 1, trip: 1 }, { unique: true });
reviewSchema.index({ trip: 1, rating: -1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('review', reviewSchema);
module.exports = Review;
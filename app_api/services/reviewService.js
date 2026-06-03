/**
 * Review Service
 * 
 * Handles creating and retrieving reviews with aggregation pipelines
 * to calculate average ratings. This is completely new functionality
 * that didnt exist in the original project at all.
 * 
 * The aggregation pipeline part was the most interesting to learn -
 * MongoDB can do the average rating calculation in the database instead
 * of pulling all reviews into Node and calculating there.
 * 
 * @module services/reviewService
 */

const mongoose = require('mongoose');
const Review = require('../models/review');
const Trip = require('../models/travlr');

/**
 * Create a new review for a trip
 * Uses aggregation after saving to update the trips average rating
 * 
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} tripId - Trip's MongoDB ObjectId
 * @param {number} rating - Star rating 1-5
 * @param {string} comment - Written review text
 * @returns {Promise<Object>} Created review object
 * @throws {Error} If already reviewed, trip not found, or save fails
 */
const createReview = async (userId, tripId, rating, comment) => {
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        const error = new Error('Invalid trip ID');
        error.status = 400;
        throw error;
    }

    // Check the trip actually exists
    const trip = await Trip.findById(tripId).exec();
    if (!trip) {
        const error = new Error('Trip not found');
        error.status = 404;
        throw error;
    }

    // Check user hasnt already reviewed this trip
    // The unique index on review schema would catch this too, but
    // better to give a clear error message than a Mongoose duplicate key error
    const existingReview = await Review.findOne({
        user: userId,
        trip: tripId
    }).exec();

    if (existingReview) {
        const error = new Error('You have already reviewed this trip');
        error.status = 400;
        throw error;
    }

    // Validate rating range
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        const error = new Error('Rating must be a whole number between 1 and 5');
        error.status = 400;
        throw error;
    }

    // Create the review
    const review = new Review({
        user: userId,
        trip: tripId,
        rating,
        comment: comment.trim()
    });

    await review.save();

    // Update the trip's average rating using aggregation pipeline
    // This calculates the new average from ALL reviews for this trip
    await updateTripRating(tripId);

    return review;
};

/**
 * Update a trip's average rating using MongoDB aggregation
 * Called after any review is created or deleted
 * 
 * The aggregation pipeline groups all reviews for a trip,
 * calculates the average rating, and updates the trip document.
 * Much more efficient than loading all reviews and calculating in JS.
 * 
 * @param {string} tripId - Trip's MongoDB ObjectId
 */
const updateTripRating = async (tripId) => {
    const result = await Review.aggregate([
        // Stage 1: Only look at reviews for this specific trip
        { $match: { trip: new mongoose.Types.ObjectId(tripId) } },

        // Stage 2: Calculate average rating and count reviews
        {
            $group: {
                _id: '$trip',
                avgRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        // Round average to 1 decimal place
        const avgRating = Math.round(result[0].avgRating * 10) / 10;

        await Trip.findByIdAndUpdate(tripId, {
            avgRating,
            reviewCount: result[0].reviewCount
        });
    } else {
        // No reviews left - reset to defaults
        await Trip.findByIdAndUpdate(tripId, {
            avgRating: 0,
            reviewCount: 0
        });
    }
};

/**
 * Get all reviews for a specific trip
 * @param {string} tripId - Trip's MongoDB ObjectId
 * @returns {Promise<Array>} Array of review objects with user info
 */
const getTripReviews = async (tripId) => {
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        const error = new Error('Invalid trip ID');
        error.status = 400;
        throw error;
    }

    const reviews = await Review.find({ trip: tripId })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .exec();

    return reviews;
};

/**
 * Get trip statistics using aggregation pipeline
 * Returns average rating, review count, rating distribution
 * 
 * @param {string} tripId - Trip's MongoDB ObjectId
 * @returns {Promise<Object>} Stats object with rating breakdown
 */
const getTripStats = async (tripId) => {
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        const error = new Error('Invalid trip ID');
        error.status = 400;
        throw error;
    }

    const stats = await Review.aggregate([
        { $match: { trip: new mongoose.Types.ObjectId(tripId) } },
        {
            $group: {
                _id: '$trip',
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            avgRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
    }

    return {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        ratingDistribution: {
            5: stats[0].fiveStars,
            4: stats[0].fourStars,
            3: stats[0].threeStars,
            2: stats[0].twoStars,
            1: stats[0].oneStar
        }
    };
};

/**
 * Get most popular trips by booking count using aggregation
 * Used for analytics and featured trips on homepage
 * 
 * @param {number} limit - Number of trips to return (default 5)
 * @returns {Promise<Array>} Array of popular trips
 */
const getPopularTrips = async (limit = 5) => {
    const trips = await Trip.aggregate([
        // Only include trips that have at least one booking
        { $match: { bookingCount: { $gt: 0 } } },

        // Sort by booking count descending, then by rating
        { $sort: { bookingCount: -1, avgRating: -1 } },

        // Limit results
        { $limit: limit },

        // Only return fields we need
        {
            $project: {
                name: 1,
                resort: 1,
                perPerson: 1,
                image: 1,
                bookingCount: 1,
                avgRating: 1,
                reviewCount: 1
            }
        }
    ]);

    return trips;
};

module.exports = {
    createReview,
    getTripReviews,
    getTripStats,
    getPopularTrips,
    updateTripRating
};
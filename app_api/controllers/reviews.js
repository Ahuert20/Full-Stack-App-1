/**
 * Reviews Controller
 * Handles HTTP requests for the review endpoints
 * Delegates all business logic to reviewService
 * 
 * @module controllers/reviews
 */

const reviewService = require('../services/reviewService');

/**
 * POST: /api/trips/:tripId/reviews - Create a review for a trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReview = async (req, res) => {
    try {
        const userId = req.auth._id;
        const tripId = req.params.tripId;
        const { rating, comment } = req.body;

        const review = await reviewService.createReview(
            userId,
            tripId,
            Number(rating),
            comment
        );

        res.status(201).json(review);

    } catch (err) {
        console.error('Error in createReview:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * GET: /api/trips/:tripId/reviews - Get all reviews for a trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTripReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getTripReviews(req.params.tripId);
        res.status(200).json(reviews);

    } catch (err) {
        console.error('Error in getTripReviews:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * GET: /api/trips/:tripId/stats - Get rating stats for a trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTripStats = async (req, res) => {
    try {
        const stats = await reviewService.getTripStats(req.params.tripId);
        res.status(200).json(stats);

    } catch (err) {
        console.error('Error in getTripStats:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * GET: /api/trips/popular - Get most popular trips by booking count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPopularTrips = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const trips = await reviewService.getPopularTrips(limit);
        res.status(200).json(trips);

    } catch (err) {
        console.error('Error in getPopularTrips:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = {
    createReview,
    getTripReviews,
    getTripStats,
    getPopularTrips
};
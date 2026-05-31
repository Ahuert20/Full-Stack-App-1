/**
 * Trips Controller
 * Handles HTTP requests and responses for trip endpoints
 * Delegates business logic to tripService and searchService
 * 
 * @module controllers/trips
 */

const tripService = require('../services/tripService');
const searchService = require('../utils/searchService');

/**
 * GET: /api/trips - List all trips with optional filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const tripsList = async (req, res) => {
    try {
        const options = {
            location: req.query.location,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20
        };

        const result = await searchService.getTripsWithPagination(options);
        res.status(200).json(result);

    } catch (err) {
        console.error('Error in tripsList:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * GET: /api/search - Autocomplete search using Trie
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const tripsSearch = async (req, res) => {
    try {
        const query = req.query.q || '';
        const limit = parseInt(req.query.limit) || 10;

        const result = await searchService.searchTrips(query, limit);
        res.status(200).json(result);

    } catch (err) {
        console.error('Error in tripsSearch:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * GET: /api/search/stats - Get search performance stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const tripsSearchStats = async (req, res) => {
    try {
        const stats = searchService.getStats();
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Could not retrieve stats' });
    }
};

/**
 * GET: /api/trips/:tripCode - Find a single trip by code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const tripsFindByCode = async (req, res) => {
    try {
        const trip = await tripService.getTripByCode(req.params.tripCode);
        res.status(200).json(trip);

    } catch (err) {
        console.error('Error in tripsFindByCode:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * POST: /api/trips - Create a new trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const tripsAddTrip = async (req, res) => {
    try {
        const newTrip = await tripService.createTrip(req.body);

        // Update Trie and invalidate cache
        searchService.updateTrieIndex('add', newTrip);
        searchService.invalidateTripCache(newTrip);

        res.status(201).json(newTrip);

    } catch (err) {
        console.error('Error in tripsAddTrip:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * PUT: /api/trips/:tripCode - Update an existing trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const tripsUpdateTrip = async (req, res) => {
    try {
        // Get old trip data before update for Trie cleanup
        const oldTrip = await tripService.getTripByCode(req.params.tripCode);
        const updatedTrip = await tripService.updateTrip(
            req.params.tripCode,
            req.body
        );

        // Update Trie index and invalidate stale cache
        searchService.updateTrieIndex('update', updatedTrip, oldTrip);
        searchService.invalidateTripCache(updatedTrip);

        res.status(200).json(updatedTrip);

    } catch (err) {
        console.error('Error in tripsUpdateTrip:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

/**
 * DELETE: /api/trips/:tripCode - Delete a trip
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const tripsDeleteTrip = async (req, res) => {
    try {
        const trip = await tripService.getTripByCode(req.params.tripCode);
        await tripService.deleteTrip(req.params.tripCode);

        // Remove from Trie and clear cache
        searchService.updateTrieIndex('delete', trip);
        searchService.invalidateTripCache(trip);

        res.status(200).json({
            message: 'Trip deleted successfully'
        });

    } catch (err) {
        console.error('Error in tripsDeleteTrip:', err);
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = {
    tripsList,
    tripsSearch,
    tripsSearchStats,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip,
    tripsDeleteTrip
};
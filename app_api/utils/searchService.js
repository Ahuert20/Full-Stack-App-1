/**
 * Search Service
 * 
 * This is where all the search logic lives. It ties together the Trie for autocomplete, the LRU cache for performance, and a relevance
 * scoring algorithm to rank results by usefulness.
 
 * The relevance scorer was the most interesting part to figure out - I had to think through what makes one trip "more relevant" than another
 * when someone searches for something like "beach".
 
 * @module utils/searchService
 */

const TrieSearch = require('./TrieSearch');
const LRUCache = require('./LRUCache');
const Trip = require('../models/travlr');

// Single instances shared across the whole app
// Built once on startup, updated when trips change
const trieSearch = new TrieSearch();
const searchCache = new LRUCache(100, 5 * 60 * 1000); // 100 items, 5 min TTL
const tripCache = new LRUCache(50, 10 * 60 * 1000);   // 50 items, 10 min TTL

let isInitialized = false;

/**
 * Initialize the search service by loading all trips from the database
 * and building the Trie index. Called once when the server starts.
 * 
 * @returns {Promise<void>}
 */
const initialize = async () => {
    try {
        console.log('Initializing search service...');
        const trips = await Trip.find({}).exec();
        trieSearch.rebuild(trips);
        isInitialized = true;
        console.log(`Search service ready - indexed ${trips.length} trips`);
    } catch (err) {
        console.error('Failed to initialize search service:', err);
        // Dont crash the server if search fails to init
        isInitialized = false;
    }
};

/**
 * Calculate a relevance score for a trip based on the search query
 * 
 * Higher score = more relevant result
 * Scoring factors:
 *   - Exact name match: 100 points
 *   - Name starts with query: 80 points  
 *   - Name contains query: 60 points
 *   - Resort exact match: 70 points
 *   - Resort contains query: 50 points
 *   - Description contains query: 20 points
 * 
 * @param {Object} trip - Trip document from database
 * @param {string} query - Search query string
 * @returns {number} Relevance score (higher is better)
 */
const calculateRelevanceScore = (trip, query) => {
    if (!query || !trip) return 0;

    const q = query.toLowerCase().trim();
    const name = (trip.name || '').toLowerCase();
    const resort = (trip.resort || '').toLowerCase();
    const description = (trip.description || '').toLowerCase();

    let score = 0;

    // Name matching - most important factor
    if (name === q) {
        score += 100; // Exact match
    } else if (name.startsWith(q)) {
        score += 80;  // Starts with query
    } else if (name.includes(q)) {
        score += 60;  // Contains query somewhere
    }

    // Resort/location matching
    if (resort === q) {
        score += 70;
    } else if (resort.startsWith(q)) {
        score += 55;
    } else if (resort.includes(q)) {
        score += 50;
    }

    // Description matching - lowest weight
    if (description.includes(q)) {
        score += 20;
    }

    // Small bonus for shorter names (more specific matches rank higher)
    if (score > 0 && name.length < 30) {
        score += 5;
    }

    return score;
};

/**
 * Search for trips using the Trie autocomplete
 * Results are ranked by relevance score
 * 
 * @param {string} query - Search prefix typed by user
 * @param {number} limit - Max results (default 10)
 * @returns {Promise<Array>} Ranked array of matching trips
 */
const searchTrips = async (query, limit = 10) => {
    if (!query || query.trim().length < 2) {
        return { results: [], source: 'empty', total: 0 };
    }

    const cacheKey = `search:${query.toLowerCase().trim()}:${limit}`;

    // Check cache first - this is the whole point of the LRU cache
    const cached = searchCache.get(cacheKey);
    if (cached) {
        return { ...cached, source: 'cache' };
    }

    let results = [];

    // Use Trie if its been initialized, fall back to DB if not
    if (isInitialized) {
        results = trieSearch.search(query, limit * 2); // Get extra for scoring
    } else {
        // Fallback: direct database query (slower but works)
        results = await Trip.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { resort: { $regex: query, $options: 'i' } }
            ]
        }).limit(limit * 2).exec();
    }

    // Score and sort by relevance
    const scored = results
        .map(trip => ({
            trip,
            score: calculateRelevanceScore(trip, query)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.trip);

    const response = {
        results: scored,
        total: scored.length,
        query: query.trim()
    };

    // Store in cache for next time
    searchCache.set(cacheKey, response);

    return { ...response, source: isInitialized ? 'trie' : 'database' };
};

/**
 * Get all trips with optional filters and pagination
 * Uses LRU cache to avoid repeated database hits for same queries
 * 
 * @param {Object} options - Query options
 * @param {string} options.location - Filter by resort name
 * @param {number} options.minPrice - Minimum price filter
 * @param {number} options.maxPrice - Maximum price filter
 * @param {number} options.page - Page number (default 1)
 * @param {number} options.limit - Results per page (default 20)
 * @returns {Promise<Object>} Paginated trips with metadata
 */
const getTripsWithPagination = async (options = {}) => {
    const {
        location,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20
    } = options;

    // Build cache key from all query params
    const cacheKey = `trips:${location || ''}:${minPrice || ''}:${maxPrice || ''}:${page}:${limit}`;

    // Check cache first
    const cached = tripCache.get(cacheKey);
    if (cached) {
        return { ...cached, source: 'cache' };
    }

    // Build MongoDB query
    let query = {};

    if (location) {
        query.resort = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
        query.perPerson = {};
        if (minPrice) query.perPerson.$gte = Number(minPrice);
        if (maxPrice) query.perPerson.$lte = Number(maxPrice);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Run query and count in parallel for efficiency
    const [trips, total] = await Promise.all([
        Trip.find(query).skip(skip).limit(limit).exec(),
        Trip.countDocuments(query).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    const response = {
        trips,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };

    // Cache the results
    tripCache.set(cacheKey, response);

    return { ...response, source: 'database' };
};

/**
 * Invalidate cache entries related to a specific trip
 * Called when a trip is created, updated, or deleted so users
 * dont see stale data
 * 
 * @param {Object} trip - The trip that was modified
 */
const invalidateTripCache = (trip) => {
    // Clear all trip listing caches since any change affects lists
    tripCache.clear();

    // Clear search caches related to this trip
    if (trip.name) {
        const words = trip.name.toLowerCase().split(' ');
        words.forEach(word => {
            searchCache.delete(`search:${word}`);
        });
    }

    console.log('Cache invalidated after trip modification');
};

/**
 * Update the Trie after a trip is added, modified, or removed
 * Keeps the search index in sync with the database
 * 
 * @param {string} action - 'add', 'update', or 'delete'
 * @param {Object} trip - The trip that changed
 * @param {Object} oldTrip - The old trip data (for updates)
 */
const updateTrieIndex = (action, trip, oldTrip = null) => {
    if (!isInitialized) return;

    if (action === 'add') {
        if (trip.name) trieSearch.insert(trip.name, trip);
        if (trip.resort) trieSearch.insert(trip.resort, trip);

    } else if (action === 'update') {
        // Remove old entries first
        if (oldTrip) {
            if (oldTrip.name) trieSearch.remove(oldTrip.name, trip._id);
            if (oldTrip.resort) trieSearch.remove(oldTrip.resort, trip._id);
        }
        // Add new entries
        if (trip.name) trieSearch.insert(trip.name, trip);
        if (trip.resort) trieSearch.insert(trip.resort, trip);

    } else if (action === 'delete') {
        if (trip.name) trieSearch.remove(trip.name, trip._id);
        if (trip.resort) trieSearch.remove(trip.resort, trip._id);
    }
};

/**
 * Get performance stats for monitoring
 * @returns {Object} Combined stats from cache and trie
 */
const getStats = () => {
    return {
        trie: trieSearch.getStats(),
        searchCache: searchCache.getStats(),
        tripCache: tripCache.getStats(),
        initialized: isInitialized
    };
};

module.exports = {
    initialize,
    searchTrips,
    getTripsWithPagination,
    invalidateTripCache,
    updateTrieIndex,
    getStats
};
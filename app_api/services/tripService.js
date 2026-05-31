/**
 * Trip Service
 * Handles all business logic for trip operations
 * Separates business logic from HTTP handling in controllers
 * 
 * @module services/tripService
 */

const Trip = require('../models/travlr');

/**
 * Get all trips with optional filtering
 * @param {Object} filters - Query filters (location, minPrice, maxPrice)
 * @returns {Promise<Array>} Array of trip objects
 * @throws {Error} If database query fails
 */
const getAllTrips = async (filters = {}) => {
    try {
        let query = {};

        // Filter by location (case insensitive)
        if (filters.location) {
            query.resort = { $regex: filters.location, $options: 'i' };
        }

        // Filter by price range
        if (filters.minPrice || filters.maxPrice) {
            query.perPerson = {};

            if (filters.minPrice) {
                const minPrice = Number(filters.minPrice);
                if (isNaN(minPrice) || minPrice < 0) {
                    throw new Error('Invalid minimum price');
                }
                query.perPerson.$gte = minPrice;
            }

            if (filters.maxPrice) {
                const maxPrice = Number(filters.maxPrice);
                if (isNaN(maxPrice) || maxPrice < 0) {
                    throw new Error('Invalid maximum price');
                }
                query.perPerson.$lte = maxPrice;
            }
        }

        const trips = await Trip.find(query).exec();
        return trips;

    } catch (err) {
        throw err;
    }
};

/**
 * Find a single trip by its code
 * @param {string} tripCode - Unique trip code
 * @returns {Promise<Object>} Trip object
 * @throws {Error} If trip not found or database query fails
 */
const getTripByCode = async (tripCode) => {
    try {
        const trip = await Trip.findOne({ code: tripCode }).exec();
        
        if (!trip) {
            const error = new Error('Trip not found');
            error.status = 404;
            throw error;
        }

        return trip;

    } catch (err) {
        throw err;
    }
};

/**
 * Create a new trip
 * @param {Object} tripData - Trip data object
 * @param {string} tripData.code - Unique trip code
 * @param {string} tripData.name - Trip name
 * @param {string} tripData.length - Trip duration
 * @param {Date} tripData.start - Start date
 * @param {string} tripData.resort - Resort location
 * @param {number} tripData.perPerson - Price per person
 * @param {string} tripData.image - Image URL
 * @param {string} tripData.description - Trip description
 * @returns {Promise<Object>} Created trip object
 * @throws {Error} If validation fails or database save fails
 */
const createTrip = async (tripData) => {
    try {
        // Validate required fields
        const requiredFields = ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'];
        for (const field of requiredFields) {
            if (!tripData[field]) {
                const error = new Error(`Missing required field: ${field}`);
                error.status = 400;
                throw error;
            }
        }

        // Validate price is positive
        const price = Number(tripData.perPerson);
        if (isNaN(price) || price <= 0) {
            const error = new Error('Price per person must be a positive number');
            error.status = 400;
            throw error;
        }

        // Validate start date is in the future
        const startDate = new Date(tripData.start);
        if (startDate < new Date()) {
            const error = new Error('Start date must be in the future');
            error.status = 400;
            throw error;
        }

        const newTrip = new Trip({
            code: tripData.code,
            name: tripData.name,
            length: tripData.length,
            start: startDate,
            resort: tripData.resort,
            perPerson: price,
            image: tripData.image,
            description: tripData.description
        });

        const savedTrip = await newTrip.save();
        return savedTrip;

    } catch (err) {
        throw err;
    }
};

/**
 * Update an existing trip
 * @param {string} tripCode - Unique trip code
 * @param {Object} tripData - Updated trip data
 * @returns {Promise<Object>} Updated trip object
 * @throws {Error} If trip not found, validation fails, or database update fails
 */
const updateTrip = async (tripCode, tripData) => {
    try {
        // Validate price if provided
        if (tripData.perPerson !== undefined) {
            const price = Number(tripData.perPerson);
            if (isNaN(price) || price <= 0) {
                const error = new Error('Price per person must be a positive number');
                error.status = 400;
                throw error;
            }
            tripData.perPerson = price;
        }

        // Validate start date if provided
        if (tripData.start) {
            const startDate = new Date(tripData.start);
            if (startDate < new Date()) {
                const error = new Error('Start date must be in the future');
                error.status = 400;
                throw error;
            }
            tripData.start = startDate;
        }

        const updatedTrip = await Trip.findOneAndUpdate(
            { code: tripCode },
            tripData,
            { new: true, runValidators: true }
        ).exec();

        if (!updatedTrip) {
            const error = new Error('Trip not found');
            error.status = 404;
            throw error;
        }

        return updatedTrip;

    } catch (err) {
        throw err;
    }
};

/**
 * Delete a trip
 * @param {string} tripCode - Unique trip code
 * @returns {Promise<Object>} Deleted trip object
 * @throws {Error} If trip not found or database deletion fails
 */
const deleteTrip = async (tripCode) => {
    try {
        const deletedTrip = await Trip.findOneAndDelete({ code: tripCode }).exec();

        if (!deletedTrip) {
            const error = new Error('Trip not found');
            error.status = 404;
            throw error;
        }

        return deletedTrip;

    } catch (err) {
        throw err;
    }
};

module.exports = {
    getAllTrips,
    getTripByCode,
    createTrip,
    updateTrip,
    deleteTrip
};
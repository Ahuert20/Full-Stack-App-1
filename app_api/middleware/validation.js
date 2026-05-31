/**
 * Validation Middleware
 * Provides input validation and sanitization for API endpoints
 * Uses express-validator for comprehensive validation
 * Added search query validation for Module 4 enhancements
 * 
 * @module middleware/validation
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 * Returns 400 error if validation fails
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * Validation rules for trip creation
 */
const validateTripCreate = [
    body('code')
        .trim()
        .notEmpty().withMessage('Trip code is required')
        .isLength({ min: 3, max: 10 }).withMessage('Trip code must be 3-10 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Trip code must contain only uppercase letters and numbers'),

    body('name')
        .trim()
        .notEmpty().withMessage('Trip name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Trip name must be 3-100 characters')
        .escape(),

    body('length')
        .trim()
        .notEmpty().withMessage('Trip length is required')
        .isLength({ min: 1, max: 50 }).withMessage('Trip length must be 1-50 characters'),

    body('start')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('Start date must be in the future');
            }
            return true;
        }),

    body('resort')
        .trim()
        .notEmpty().withMessage('Resort is required')
        .isLength({ min: 3, max: 100 }).withMessage('Resort must be 3-100 characters')
        .escape(),

    body('perPerson')
        .notEmpty().withMessage('Price per person is required')
        .isFloat({ min: 1, max: 100000 }).withMessage('Price must be between 1 and 100000')
        .toFloat(),

    body('image')
        .trim()
        .notEmpty().withMessage('Image URL is required')
        .isURL().withMessage('Image must be a valid URL'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters')
        .escape(),

    validate
];

/**
 * Validation rules for trip update
 */
const validateTripUpdate = [
    body('code')
        .optional()
        .trim()
        .isLength({ min: 3, max: 10 }).withMessage('Trip code must be 3-10 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Trip code must contain only uppercase letters and numbers'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Trip name must be 3-100 characters')
        .escape(),

    body('length')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage('Trip length must be 1-50 characters'),

    body('start')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('Start date must be in the future');
            }
            return true;
        }),

    body('resort')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Resort must be 3-100 characters')
        .escape(),

    body('perPerson')
        .optional()
        .isFloat({ min: 1, max: 100000 }).withMessage('Price must be between 1 and 100000')
        .toFloat(),

    body('image')
        .optional()
        .trim()
        .isURL().withMessage('Image must be a valid URL'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters')
        .escape(),

    validate
];

/**
 * Validation rules for user registration
 */
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    validate
];

/**
 * Validation rules for user login
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    validate
];

/**
 * Validation rules for trip code parameter
 */
const validateTripCode = [
    param('tripCode')
        .trim()
        .notEmpty().withMessage('Trip code is required')
        .isLength({ min: 3, max: 10 }).withMessage('Trip code must be 3-10 characters'),

    validate
];

/**
 * Validation rules for trip ID parameter
 */
const validateTripId = [
    param('tripId')
        .trim()
        .notEmpty().withMessage('Trip ID is required')
        .isMongoId().withMessage('Trip ID must be a valid MongoDB ObjectId'),

    validate
];

/**
 * Validation rules for trip list query parameters
 * Now includes pagination support added in Module 4
 */
const validateTripQuery = [
    query('location')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Location must be 2-100 characters')
        .escape(),

    query('minPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number')
        .toFloat(),

    query('maxPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number')
        .toFloat(),

    // Pagination params added for Module 4
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt(),

    validate
];

/**
 * Validation rules for search query
 * Added in Module 4 for the Trie-based autocomplete endpoint
 */
const validateSearchQuery = [
    query('q')
        .notEmpty().withMessage('Search query is required')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Search query must be 2-100 characters')
        .escape(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
        .toInt(),

    validate
];

module.exports = {
    validateTripCreate,
    validateTripUpdate,
    validateRegister,
    validateLogin,
    validateTripCode,
    validateTripId,
    validateTripQuery,
    validateSearchQuery
};
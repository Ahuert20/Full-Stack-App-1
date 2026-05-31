/**
 * Authentication Service
 * Handles all business logic for user authentication
 * Manages user registration and login operations
 * 
 * @module services/authService
 */

const User = require('../models/user');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} Object containing JWT token
 * @throws {Error} If validation fails or user already exists
 */
const registerUser = async (userData) => {
    try {
        const { name, email, password } = userData;

        // Validate required fields
        if (!name || !email || !password) {
            const error = new Error('All fields required');
            error.status = 400;
            throw error;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const error = new Error('Invalid email format');
            error.status = 400;
            throw error;
        }

        // Validate password strength (minimum 6 characters)
        if (password.length < 6) {
            const error = new Error('Password must be at least 6 characters');
            error.status = 400;
            throw error;
        }

        // Validate name length
        if (name.trim().length < 2 || name.trim().length > 100) {
            const error = new Error('Name must be between 2 and 100 characters');
            error.status = 400;
            throw error;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() }).exec();
        if (existingUser) {
            const error = new Error('Email already registered');
            error.status = 400;
            throw error;
        }

        // Create new user
        const user = new User();
        user.name = name.trim();
        user.email = email.toLowerCase();
        user.setPassword(password);

        await user.save();

        // Generate JWT token
        const token = user.generateJWT();

        return { token };

    } catch (err) {
        throw err;
    }
};

/**
 * Authenticate user and generate JWT token
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Object containing JWT token
 * @throws {Error} If credentials invalid or user not found
 */
const loginUser = async (email, password) => {
    try {
        // Validate required fields
        if (!email || !password) {
            const error = new Error('All fields required');
            error.status = 400;
            throw error;
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).exec();

        if (!user) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            throw error;
        }

        // Validate password
        if (!user.validPassword(password)) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            throw error;
        }

        // Generate JWT token
        const token = user.generateJWT();

        return { token };

    } catch (err) {
        throw err;
    }
};

/**
 * Validate JWT token and return user data
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User data from token
 * @throws {Error} If token invalid
 */
const validateToken = (token) => {
    const jwt = require('jsonwebtoken');
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        const error = new Error('Invalid token');
        error.status = 401;
        throw error;
    }
};

module.exports = {
    registerUser,
    loginUser,
    validateToken
};
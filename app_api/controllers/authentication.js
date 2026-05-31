/**
 * Authentication Controller
 * Handles HTTP requests and responses for authentication endpoints
 * Delegates business logic to authService
 * 
 * @module controllers/authentication
 */

const authService = require('../services/authService');

/**
 * POST: /api/register - Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
    try {
        const { token } = await authService.registerUser(req.body);
        res.status(200).json({ token });

    } catch (err) {
        console.error('Error in register:', err);
        res.status(err.status || 400).json({ 
            message: err.message || 'Registration failed' 
        });
    }
};

/**
 * POST: /api/login - Authenticate user and return JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token } = await authService.loginUser(email, password);
        
        res.status(200).json({ token });

    } catch (err) {
        console.error('Error in login:', err);
        res.status(err.status || 401).json({ 
            message: err.message || 'Authentication failed' 
        });
    }
};

module.exports = {
    register,
    login
};
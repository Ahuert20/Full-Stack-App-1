/**
 * User Schema - Updated for Module 5
 * 
 * Added reviews reference to track which trips a user has reviewed.
 * Also added email validation at the schema level as an extra layer
 * of defense beyond the express-validator middleware.
 * 
 * @module models/user
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },

    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },

    // Array of trip ObjectIds the user has booked
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking'
    }],

    // Array of review ObjectIds the user has written
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'review'
    }],

    hash: String,
    salt: String

}, {
    timestamps: true
});

/**
 * Hash and store a password using PBKDF2
 * @param {string} password - Plain text password
 */
userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
};

/**
 * Verify a password against the stored hash
 * @param {string} password - Plain text password to check
 * @returns {boolean} True if password matches
 */
userSchema.methods.validPassword = function(password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
    return this.hash === hash;
};

/**
 * Generate a JWT token for this user
 * @returns {string} Signed JWT token
 */
userSchema.methods.generateJWT = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

const User = mongoose.model('user', userSchema);
module.exports = User;
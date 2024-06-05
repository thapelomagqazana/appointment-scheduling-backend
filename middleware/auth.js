/**
 * @fileoverview Middleware to authenticate users using JWT tokens.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication Middleware
 * 
 * This middleware verifies the JWT token provided in the Authorization header.
 * If the token is valid and the user exists, it attaches the user and token to the request object and calls the next middleware.
 * Otherwise, it sends a 401 Unauthorized response.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const auth = async (req, res, next) => {
    try {
        // Retrieve token from Authorization header and remove 'Bearer ' prefix
        const token = req.header("Authorization").replace("Bearer ", "");

        // Decode and verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID and ensure the token is still valid
        const user = await User.findOne({ _id: decoded._id });
        if (!user) {
            throw new Error();
        }

        // Attach user and token to the request object
        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        // Send a 401 Unauthorized response if authentication fails
        res.status(401).send({ error: "Please authenticate" });
    }
};

module.exports = auth;
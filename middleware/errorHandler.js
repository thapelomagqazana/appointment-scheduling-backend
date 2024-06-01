/**
 * @fileoverview Middleware to handle errors in the application.
 */
const { validationResult } = require("express-validator");

/**
 * Error Handling Middleware
 * 
 * This middleware handles different types of errors that can occur in the application.
 * If the headers have already been sent, it passes the error to the next middleware.
 * If the error is a validation error, it sends a 400 response with the validation errors.
 * For all other errors, it sends a response with the error message and status code.
 *
 * @param {Object} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const errorHandler = (err, req, res, next) => {
    if (res.headersSent){
        return next(err);
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({ errors: err.errors });
    }
    res.status(err.status || 500).json({ message: err.message });
};

module.exports = errorHandler;
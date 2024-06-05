/**
 * @fileoverview Controller for handling user authentication.
 */

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

/**
 * Register a new user.
 * 
 * This function registers a new user by validating the request body, checking for existing users,
 * hashing the password, and saving the user to the database. It then generates a JWT token and
 * returns it in the response.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
    // Validate the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Check new user
        user = new User({
            name,
            email,
            password,
            role
        });

        // Save the user to the database
        await user.save();

        // Create JWT payload
        const payload = { _id: user._id };

        // Sign JWT token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

/**
 * Log in an existing user.
 * 
 * This function logs in an existing user by validating the request body, checking the user's
 * credentials, and generating a JWT token if the credentials are valid.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Create JWT payload
        const payload = { _id: user._id };

        // Sign JWT token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

module.exports = { register, login };
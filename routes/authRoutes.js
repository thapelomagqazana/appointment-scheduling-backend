/**
 * @fileoverview Routes for user authentication.
 */

const express = require("express");
const { check } = require("express-validator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

/**
 * @route   POST /register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    "/register",
    [
        check("name", "Name is required").not().isEmpty(),
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
        check("role", "Role is required").not().isEmpty()
    ],
    register
);


/**
 * @route   POST /login
 * @desc    Log in an existing user
 * @access  Public
 */
router.post(
    "/login",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists()
    ],
    login
);

module.exports = router;
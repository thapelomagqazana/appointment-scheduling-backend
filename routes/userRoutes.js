/**
 * @fileoverview Routes for user profile management.
 */

const express = require('express');
const auth = require('../middleware/auth');
const { getProfile } = require('../controllers/userController');

const router = express.Router();

/**
 * @route   GET /profile
 * @desc    Get profile details of the authenticated user
 * @access  Private
 */
router.get('/profile', auth, getProfile);

module.exports = router;

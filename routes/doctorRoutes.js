/**
 * @fileoverview Routes for handling doctor availability.
 */

const express = require('express');
const auth = require('../middleware/auth');
const { setAvailability, getAvailability } = require('../controllers/doctorController');

const router = express.Router();

/**
 * @route   POST /availability
 * @desc    Set doctor availability
 * @access  Private
 */
router.post('/availability', auth, setAvailability);

/**
 * @route   GET /availability/:id
 * @desc    Get doctor availability by user ID
 * @access  Private
 */
router.get('/availability/:id', auth, getAvailability);

module.exports = router;
/**
 * @fileoverview Routes for handling doctor availability.
 */

const express = require('express');
const auth = require('../middleware/auth');
const authorize = require("../middleware/authorize");
const { setAvailability, getAvailability } = require('../controllers/doctorController');

const router = express.Router();

/**
 * @route   POST /availability
 * @desc    Set doctor availability
 * @access  Private
 */
router.post('/availability', auth, authorize("doctor"), setAvailability);

/**
 * @route   GET /availability/:id
 * @desc    Get doctor availability by user ID
 * @access  Private
 */
router.get('/availability/:id', auth, authorize(["doctor", "receptionist"]), getAvailability);

module.exports = router;
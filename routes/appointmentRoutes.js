const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { createAppointment, getAppointments, updateAppointment, deleteAppointment } = require("../controllers/appointmentController");

const router = express.Router();

/**
 * @route   POST /api/appointments/create
 * @desc    Create a new appointment
 * @access  Private (Patient only)
 */
router.post("/create", auth, authorize("patient"), createAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments
 * @access  Private (Doctor and Receptionist)
 */
router.get("/", auth, authorize(["doctor", "receptionist"]), getAppointments);

/**
 * @route   PUT /appointments/:id
 * @desc    Update appointment status
 * @access  Private (Doctor and Receptionist)
 */
router.put("/update/:id", auth, authorize(["doctor", "receptionist"]), updateAppointment);

/**
 * @route   DELETE /appointments/:id
 * @desc    Delete an appointment
 * @access  Private (Doctor and Receptionist)
 */
router.delete("/delete/:id", auth, authorize(["doctor", "receptionist"]),  deleteAppointment);

module.exports = router;
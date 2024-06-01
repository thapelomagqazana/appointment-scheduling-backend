/**
 * @fileoverview Defines the Appointment model schema for the application using Mongoose.
 */
const mongoose = require("mongoose");

/**
 * Appointment Schema
 * 
 * Represents an appointment in the system with references to a patient and a doctor, a date, status, and an optional reason.
 */
const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
    },
    status: {
        type: String,
        enum: ["scheduled", "confirmed", "cancelled"],
        default: "scheduled",
    },
    reason: {
        type: String,
    },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
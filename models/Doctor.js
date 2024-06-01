/**
 * @fileoverview Defines the Doctor model schema for the application using Mongoose.
 */
const mongoose = require("mongoose");

/**
 * Doctor Schema
 * 
 * Represents a doctor in the system with a reference to a user and an array of availability slots.
 */
const DoctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    availability: [
        {
            date: {
                type: Date,
                required: true,
            },
            slots: {
                type: [String],
                validate: {
                    validator: function (v) {
                        return v.length > 0;
                    },
                    message: "Slots array should not be empty",
                },
            },
        },
    ],
});

module.exports = mongoose.model("Doctor", DoctorSchema);
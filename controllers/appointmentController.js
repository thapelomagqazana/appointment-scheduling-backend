const Appointment = require("../models/Appointment");

/**
 * Create a new appointment.
 *
 * This function creates a new appointment by taking the patient, doctor, date, and reason from the request body,
 * checking for existing appointments with the same doctor and overlapping times, saving the appointment to the database,
 * and returning the created appointment in the response.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAppointment = async (req, res) => {
    const { patient, doctor, date, reason } = req.body;
    const appointmentDate = new Date(date);

    try {
        // Check for overlapping appointments
        const existingAppointments = await Appointment.find({
            doctor,
            date: {
                $gte: new Date(appointmentDate.setMinutes(appointmentDate.getMinutes() - 30)),
                $lte: new Date(appointmentDate.setMinutes(appointmentDate.getMinutes() + 60))
            }
        });

        if (existingAppointments.length > 0){
            return res.status(400).json({ msg: "Doctor is already booked for this time slot" });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            patient,
            doctor,
            date: appointmentDate,
            reason
        });

        const appointment = await newAppointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

/**
 * Get all appointments.
 *
 * This function retrieves all appointments from the database, populates the patient and doctor fields,
 * and returns the list of appointments in the response.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate("patient").populate("doctor");
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

/**
 * Update an appointment status.
 *
 * This function updates the status of an appointment by taking the status from the request body,
 * updating the corresponding appointment in the database, and returning the updated appointment in the response.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAppointment = async (req, res) => {
    const { status } = req.body;
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(appointment);
    } catch (error) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

/**
 * Delete an appointment.
 *
 * This function deletes an appointment by its ID, removes it from the database, and returns a success message in the response.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ msg: "Appointment removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { createAppointment, getAppointments, updateAppointment, deleteAppointment };
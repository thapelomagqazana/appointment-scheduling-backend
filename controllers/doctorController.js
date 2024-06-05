/**
 * @fileoverview Controller for handling doctor availability.
 */

const Doctor = require("../models/Doctor");

/**
 * Set doctor availability.
 *
 * This function sets the availability of a doctor by updating or creating the availability
 * schedule in the database. It takes the availability from the request body.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setAvailability = async (req, res) => {
    const { availability } = req.body;
    try {
        let doctor = await Doctor.findOne({ user: req.user.id });
        if (!doctor){
            doctor = new Doctor({
                user: req.user.id,
                availability
            });
        } else {
            doctor.availability = availability;
        }

        await doctor.save();
        res.json(doctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

/**
 * Get doctor availability.
 *
 * This function retrieves the availability of a specific doctor by their user ID and returns
 * it in the response.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAvailability = async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ user: req.params.id }).populate('user');
      res.json(doctor);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
};
  
  module.exports = { setAvailability, getAvailability };
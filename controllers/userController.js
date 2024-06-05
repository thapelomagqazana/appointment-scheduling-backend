/**
 * @fileoverview Controller for handling user profile retrieval.
 */

const User = require("../models/User");

/**
 * Get the profile details of the authenticated user.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user){
            return res.status(404).json({ msg: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { getProfile };
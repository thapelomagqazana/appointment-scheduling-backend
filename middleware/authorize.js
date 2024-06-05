/**
 * @fileoverview Middleware for role-based access control.
 */

const User = require("../models/User");

/**
 * Middleware to check if the user has the required role.
 *
 * @param {Array} roles - Array of roles that are allowed to access the route.
 * @returns {Function} - Middleware function to check user role.
 */
const authorize = (roles = []) => {
    // roles param can be a single role string (e.g., 'admin') or an array of roles (e.g., ['admin', 'user'])
    if (typeof roles === "string"){
        roles = [roles];
    }

    return [
        async (req, res, next) => {
            try {
                const user = await User.findById(req.user.id);
                if (!user || !roles.includes(user.role)){
                    return res.status(403).json({ message: "Access denied" });
                }
                next();
            } catch (err) {
                console.error(err.message);
                res.status(500).send("Server error");
            }
        }
    ];
};

module.exports = authorize;
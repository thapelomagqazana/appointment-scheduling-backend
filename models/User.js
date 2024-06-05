/**
 * @fileoverview Defines the User model schema and methods for the application using Mongoose.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * User Schema
 * 
 * Represents a user in the system with a name, email, password, and role.
 * The password is hashed before saving to the database.
 */

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address',
          ],
    },
    password: {
        type: String,
        required: [true, "Password is required"], 
    },
    role: {
        type: String,
        enum: ["receptionist", "doctor", "patient"],
        required: [true, "Role is required"],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

/**
 * Pre-save middleware to hash the password before saving the user document.
 *
 * This middleware runs before the save operation. It checks if the password field is modified.
 * If it is, it hashes the password using bcrypt.
 *
 * @function
 * @param {Function} next - The next middleware function in the stack.
 */

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")){
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }

    
});

module.exports = mongoose.model("User", UserSchema);
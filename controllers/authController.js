/**
 * @fileoverview Controller for handling user authentication.
 */

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

/**
 * Register a new user.
 * 
 * This function registers a new user by validating the request body, checking for existing users,
 * hashing the password, and saving the user to the database. It then generates a JWT token and
 * returns it in the response.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
    // Validate the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Check new user
        user = new User({
            name,
            email,
            password,
            role
        });

        // Save the user to the database
        await user.save();

        // Create JWT payload
        const payload = { _id: user._id };

        // Sign JWT token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

/**
 * Log in an existing user.
 * 
 * This function logs in an existing user by validating the request body, checking the user's
 * credentials, and generating a JWT token if the credentials are valid.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Create JWT payload
        const payload = { _id: user._id };

        // Sign JWT token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

/**
 * Request a password reset.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user){
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
              Please click on the following link, or paste this into your browser to complete the process:\n\n
              ${resetUrl}\n\n
              If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
      
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              console.error('There was an error: ', err);
            } else {
              res.status(200).json('Recovery email sent');
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

/**
 * Reset password.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
  
    try {
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ msg: 'Invalid or expired token' });
      }
  
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
  
      await user.save();
  
      res.status(200).json({ msg: 'Password reset successful' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
};
  

module.exports = { register, login, requestPasswordReset, resetPassword };
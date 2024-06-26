const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require('./routes/doctorRoutes');
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("morgan");

const { scheduleNotifications } = require("./services/notificationService");

const app = express();

// Logging
app.use(logger("dev"));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use("/api/user", userRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Schedule notifications
scheduleNotifications();

module.exports = app;
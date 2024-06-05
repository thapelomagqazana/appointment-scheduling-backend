const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require('./routes/doctorRoutes');
const errorHandler = require("./middleware/errorHandler");
const logger = require("morgan");

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

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
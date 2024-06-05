const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const errorHandler = require("./middleware/errorHandler");
const logger = require("morgan");

// require("dotenv").config();

const app = express();

// Logging
// app.use(logger("dev"));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const errorHandler = require("./middleware/errorHandler");
const logger = require("morgan");

// require("dotenv").config();

const app = express();

// Connect to Database
connectDB();

// Logging
// app.use(logger("dev"));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
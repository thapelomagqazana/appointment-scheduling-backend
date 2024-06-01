/**
 * @fileoverview Configures and connects to the MongoDB database using Mongoose.
 */
const mongoose = require("mongoose");

/**
 * Connects to the MongoDB database.
 *
 * This function uses the Mongoose library to establish a connection to the MongoDB database specified by the MONGO_URI environment variable. It uses the `useNewUrlParser` and `useUnifiedTopology` options for compatibility and stability.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
 * @throws {Error} Throws an error if the connection fails, logging the error message to the console and exiting the process.
 */

const connectDB = async () => {
    try {
        // Attempt to connect to the MongoDB database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, // Use the new URL string parser
            useUnifiedTopology: true, // Use the new server discovery and monitoring engine
        });
        console.log("MongoDB connected..."); // Log successful connection
    } catch (err) {
        console.error(err.message); // Log any errors that occur during connection
        process.exit(1);  // Exit the process with failure
    }
};

module.exports = connectDB;
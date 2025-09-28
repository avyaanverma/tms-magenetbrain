const mongoose = require("mongoose");

async function connectDB() {

    // Check if DB_URI is defined
    if (!process.env.DB_URI) {
        console.error("DB_URI is not defined in environment variables");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("MongoDB connected successfully!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

module.exports = connectDB;
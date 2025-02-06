// Create new file for database connections
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create an object to store both database connections
const db = {};

// MongoDB connection
const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
        db.mongodb = mongoose.connection;
    } catch (err) {
        console.error("NOT CONNECTED TO MONGODB:", err.message);
    }
};

// MySQL connection pool
const connectMySQL = async () => {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test the connection
        const connection = await pool.getConnection();
        console.log("Connected to MySQL");
        connection.release();
        
        db.mysql = pool;
    } catch (err) {
        console.error("MySQL Connection Failed:", err.message);
    }
};

// Initialize both connections
const initializeDBConnections = async () => {
    await connectMongo();
    await connectMySQL();
    return db;
};

module.exports = { initializeDBConnections, db };
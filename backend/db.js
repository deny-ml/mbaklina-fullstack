require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_penutupan_jalan',
    waitForConnections: true, 
    connectionLimit: 10,      
    queueLimit: 0
});

console.log("Database connection pool created.");

module.exports = connection;

require('dotenv').config();
const mysql = require('mysql2');

console.log("🕵️ CEK DB_HOST:", process.env.DB_HOST ? "Terbaca" : "KOSONG/TIDAK DITEMUKAN!");
console.log("🕵️ CEK DB_USER:", process.env.DB_USER ? "Terbaca" : "KOSONG/TIDAK DITEMUKAN!");

const connection = mysql.createPool({
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT || 17173,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, 
    connectionLimit: 2,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 20000, 
    ssl: { 
        rejectUnauthorized: false
    }
});

connection.getConnection((err, conn) => {
    if (err) {
        console.error("💥 [FATAL ERROR] GAGAL TERSAMBUNG KE AIVEN:", err.message);
    } else {
        console.log("✅ [SUKSES] MESIN BERHASIL TERSAMBUNG KE AIVEN!");
        conn.release(); 
    }
});

module.exports = connection;
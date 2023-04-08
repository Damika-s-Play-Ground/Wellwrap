const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    waitForConnections: true, // Wait for a free connection if the maximum number of connections has been reached
    queueLimit: 0, // Do not limit the number of queued connection requests
    connectTimeout: 3000 // Wait up to 3 seconds when trying to establish a new connection
});

module.exports = pool;

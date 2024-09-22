const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'junction.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'SUjHiyjKKBvNdHLNcLrOSqfhQiLRwDBD',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 41255
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
  } else {
    console.log('Connected to MySQL');
  }
});

module.exports = db;
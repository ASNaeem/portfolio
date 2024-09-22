const mysql = require('mysql2');

  const db = mysql.createConnection({
  host: 'SUjHiyjKKBvNdHLNcLrOSqfhQiLRwDBD@junction.proxy.rlwy.net',
  user: 'root',
  password: 'SUjHiyjKKBvNdHLNcLrOSqfhQiLRwDBD',
  database: 'railway',
  port: 41255
});
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'nightowl',
//   database: 'portfolio',
//   port: 3306
// });
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
  } else {
    console.log('Connected to MySQL');
  }
});

module.exports = db;

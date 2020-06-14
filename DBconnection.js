const Pool = require('pg').Pool;
require('dotenv').config();

// Function to start the DB connection and set the value from .env
var startDBConnection = () => {
      const pool = new Pool({
        user: process.env.USER,
        host: process.env.HOST,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
        port: process.env.PORT,
      });

      return pool;
}

module.exports = {
    startDBConnection,
}
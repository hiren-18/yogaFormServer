const pool = require('../config/db');

const createUserTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      batch VARCHAR(10),
      month VARCHAR(10),
      can_change_shift BOOLEAN DEFAULT TRUE,
      payment_status BOOLEAN DEFAULT FALSE
    );
  `);
};

module.exports = { createUserTable };

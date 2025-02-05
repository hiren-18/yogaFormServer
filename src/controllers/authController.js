const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi =require("joi");
const pool = require('../config/db');

require('dotenv').config();

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, date_of_birth } = req.body;
  
  try {
    // Validate age
    const birthDate = new Date(date_of_birth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    if (age < 18 || age > 65) {
      return res.status(400).json({ error: "Age must be between 18 and 65" });
    }

    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, date_of_birth) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, date_of_birth]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerUser, loginUser };


const pool = require('../config/db');

require('dotenv').config();

const getUserEnrollment = async (req, res) => {
    try {
      const userId = req.user.id;
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
      const result = await pool.query(
        "SELECT batch, month FROM users WHERE id = $1 AND month = $2",
        [userId, currentMonth]
      );
  
      if (result.rows.length === 0) {
        return res.json({ enrolled: false });
      }
  
      res.json({ enrolled: true, batch: result.rows[0].batch, month: result.rows[0].month });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };
 
  const enrollUser = async (req, res) => {
    try {
        console.log("req.user inside enrollUser:", req.user.id); 
      const userId = req.user.id;

      const { batch, month } = req.body;
  
      // Validate batch selection
      const validBatches = ["6-7AM", "7-8AM", "8-9AM", "5-6PM"];
      if (!validBatches.includes(batch)) {
        return res.status(400).json({ error: "Invalid batch selected" });
      }
  
      // Validate month format (e.g., "January", "February", etc.)
      const validMonths = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
      if (!validMonths.includes(month)) {
        return res.status(400).json({ error: "Invalid month format" });
      }
  
      // Get current month
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
      // Check if user is trying to enroll for a past month
      if (new Date().getMonth() > validMonths.indexOf(month)) {
        return res.status(400).json({ error: "Cannot enroll for a past month" });
      }
  
      // Fetch user details (including date_of_birth)
      const user = await pool.query("SELECT date_of_birth, can_change_shift FROM users WHERE id = $1", [userId]);
  
      if (user.rows.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }
  
      // Calculate age
      const birthDate = new Date(user.rows[0].date_of_birth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
  
      if (age < 18 || age > 65) {
        return res.status(400).json({ error: "Age must be between 18 and 65" });
      }
  
      // Check if user is already enrolled for this month
      const existingEnrollment = await pool.query(
        "SELECT * FROM users WHERE id = $1 AND month = $2",
        [userId, month]
      );
  
      if (existingEnrollment.rows.length > 0) {
        return res.status(400).json({ error: "You are already enrolled for this month" });
      }
  
      // Allow registration for next month
      if (month !== currentMonth && !user.rows[0].can_change_shift) {
        return res.status(400).json({ error: "You can register next month" });
      }
  
      // Enroll user
      await pool.query(
        "UPDATE users SET batch = $1, month = $2, can_change_shift = FALSE WHERE id = $3",
        [batch, month, userId]
      );
  
      res.json({ message: `Enrollment successful for ${month} batch ${batch}` });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  module.exports={enrollUser};
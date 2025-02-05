const jwt = require('jsonwebtoken');
const env = require('../config/dotenv');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
   
    const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;
    
    // Verify JWT token
    const decoded = jwt.verify(tokenValue, env.JWT_SECRET);
   
    req.user = decoded; 

    next(); 
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;

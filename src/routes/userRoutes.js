const express = require('express');
const {enrollUser}= require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/enrollment',authMiddleware,enrollUser);

module.exports = router;

// backend/routes/authRoutes.js
const express = require('express');
const { signup, verifyOtp, login } = require('../controllers/authController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('plan');
  res.json(user);
});
module.exports = router;

// module.exports = router;
const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP, testEmail } = require("../controllers/authController");

const rateLimit = require('express-rate-limit');

router.post("/send-otp", sendOTP); // No rate limiter needed for development
// No rate limiter needed for these routes
router.post("/verify-otp", verifyOTP);
router.post('/test-email', testEmail);
module.exports = router;
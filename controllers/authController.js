const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendMail = require("../utils/mailer");
exports.sendOTP = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ msg: "Email & username required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    await User.findOneAndUpdate(
      { email },
      {
        username,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      },
      { upsert: true, new: true }
    );

    // DEVELOPMENT: Return OTP in response
    if (process.env.NODE_ENV === 'development') {
      return res.json({ 
        msg: "OTP generated (development mode)", 
        otp: otp,
        email: email,
        expiresIn: "10 minutes"
      });
    }
    
    // PRODUCTION: Send email
    await sendMail(email, otp);
    res.json({ msg: "OTP sent to email" });
    
  } catch (err) {
    res.status(500).json({ msg: "OTP failed" });
  }
};
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (Date.now() > user.otpExpires)
      return res.status(400).json({ msg: "OTP expired" });

    // ✅ FIXED: Compare numbers explicitly
    if (Number(user.otp) !== Number(otp))
      return res.status(400).json({ msg: "Invalid OTP" });

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login success",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Verification failed" });
  }
};

// Add this new function to authController.js
exports.testEmail = async (req, res) => {
  try {
    const testOTP = Math.floor(100000 + Math.random() * 900000);
    console.log('\n🔧 Testing email service...');
    
    await sendMail(process.env.EMAIL_USER, testOTP);
    
    console.log('✅ Test email sent successfully!');
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      testEmail: process.env.EMAIL_USER
    });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.toString()
    });
  }
};
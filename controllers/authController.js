const nodemailer = require("nodemailer");
const User = require("../models/user");
const  sendMail = require("../utils/mailer");


exports.sendOTP = async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username)
      return res.status(400).json({ msg: "Email & username required" });

    const otp = Math.floor(100000 + Math.random() * 900000);

    const user = await User.findOneAndUpdate(
      { email },
      {
        username,
        otp,
        otpExpires: Date.now() + 5 * 60 * 1000,
      },
      { upsert: true, new: true }
    );

    await sendMail(email, otp);

    res.json({ msg: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "OTP failed" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  if (Date.now() > user.otpExpires)
    return res.status(400).json({ msg: "OTP expired" });

  if (user.otp !== otp)
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
};

const nodemailer = require("nodemailer");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP",
      text: `Your OTP is ${otp}`,
    });

    res.status(200).json({
      msg: "OTP sent successfully",
      otp, // remove later (for testing only)
    });

  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ msg: "OTP failed" });
  }
};

module.exports = { sendOTP };

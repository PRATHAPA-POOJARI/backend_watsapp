const nodemailer = require("nodemailer");

// ✅ Make sure transporter is defined correctly
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, otp) => {
  try {
    console.log('\n=== DEBUG: Email Configuration ===');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', to);
    console.log('Password length:', process.env.EMAIL_PASS?.length);
    console.log('Password (first 4 chars):', process.env.EMAIL_PASS?.substring(0, 4) + '...');
    console.log('OTP:', otp);
    console.log('==================================\n');
    
    // ✅ Use the correct transporter variable
    const info = await transporter.sendMail({
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
      html: `<b>Your OTP code is ${otp}</b><p>It is valid for 10 minutes.</p>`,
    });

    console.log("✅ OTP email sent to:", to);
    console.log("📧 Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    console.error("🔍 Full error details:", error);
    throw new Error("Email not sent");
  }
};

module.exports = sendMail;
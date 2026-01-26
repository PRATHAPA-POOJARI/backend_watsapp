const e = require("express");
const mongoose  = require("mongoose");

// Add these fields to your User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  otp: Number,
  otpExpires: Date,
  // WhatsApp specific fields
  phoneNumber: { type: String, unique: true, sparse: true },
  profilePicture: { type: String, default: '' },
  status: { type: String, default: 'Hey there! I am using WhatsApp' },
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);

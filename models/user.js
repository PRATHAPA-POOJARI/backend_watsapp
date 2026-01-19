const e = require("express");
const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
username: { type: String, required: true},
email:{type: String, required: true, unique: true},
otp:String,
otpExpires: Date,
createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model("User", userSchema);

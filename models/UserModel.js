const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["donor", "admin"], default: "donor" },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

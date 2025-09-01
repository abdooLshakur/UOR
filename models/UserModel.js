const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age:{type: String, },
  location:{type:String},
  phoneNumber: { type: String },
  gender: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["donor", "Admin"], default: "donor" },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

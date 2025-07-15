const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  causeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cause", required: true },
  donorName: { type: String, required: true },
  email: { type: String },
  amount: { type: Number, required: true },
  note: { type: String },
  reference: { type: String },
  status: { type: String, enum: ["Pending", "Verified"], default: "Pending" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Donation", donationSchema);

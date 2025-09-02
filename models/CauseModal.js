const mongoose = require("mongoose");

const causeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: {type:String},
  images: {type:[]},
  goalAmount: {type: Number,},
  raisedAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  location: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Cause", causeSchema);

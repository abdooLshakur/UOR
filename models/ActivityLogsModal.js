import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  relatedTo: { type: mongoose.Schema.Types.ObjectId },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model("ActivityLog", activityLogSchema);

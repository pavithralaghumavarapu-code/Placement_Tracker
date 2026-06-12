const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  interviewDate: { type: Date, required: true },
  round: { type: String, required: true },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled"
  },
  result: {
    type: String,
    enum: ["pending", "pass", "fail"],
    default: "pending"
  },
  feedback: String
}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);

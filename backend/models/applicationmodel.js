const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  status: {
    type: String,
    enum: ["applied", "shortlisted", "rejected", "selected"],
    default: "applied"
  },
  eligibility: {
    eligible: Boolean,
    reasons: [String],
    matchedSkills: [String],
    missingSkills: [String]
  },
  notes: String
}, { timestamps: true });

applicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);

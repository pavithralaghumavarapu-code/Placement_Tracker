const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resumeUrl: { type: String, required: true },
  cloudinaryPublicId: String,
  aiScore: { type: Number, default: 0 },
  extractedSkills: [{ type: String, trim: true }],
  suggestions: [String],
  analysis: String
}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);

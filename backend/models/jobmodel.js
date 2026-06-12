const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  companyName: { type: String, trim: true },
  description: { type: String, required: true },
  role: { type: String, trim: true },
  salary: String,
  location: String,
  deadline: Date,
  minCgpa: { type: Number, default: 0 },
  maxBacklogs: { type: Number, default: 0 },
  requiredSkills: [{ type: String, trim: true }],
  rounds: [{ type: String, trim: true }],
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open"
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);

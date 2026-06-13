const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },

  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },

  // For student users
  department: String,
  rollNumber: String,
  phone: String,
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  backlogs: { type: Number, min: 0, default: 0 },
  skills: [{ type: String, trim: true }],
  graduationYear: Number,
  resumeUrl: String,
  profileScore: { type: Number, default: 0 },

  // For admin users (company admins)
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  companyName: String,

}, { timestamps: true });

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);

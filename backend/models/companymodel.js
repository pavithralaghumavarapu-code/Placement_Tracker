const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  website: String,
  description: String,
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hiringHistory: [{
    year: Number,
    hiredCount: Number,
    packageOffered: String
  }],
  packages: [String],
  roles: [String]
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);

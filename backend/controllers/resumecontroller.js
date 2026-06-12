const Resume = require("../models/resumemodel");
const User = require("../models/usermodel");
const sendResponse = require("../utils/response");
const { uploadBuffer } = require("../config/cloudinary");
const { analyzeResume } = require("../services/resumeaiservice");

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return sendResponse(res, 400, "Resume file is required");

    const uploadResult = await uploadBuffer(req.file.buffer, {
      folder: "placement-tracker/resumes",
      resource_type: "auto"
    });

    const analysis = await analyzeResume({
      text: `${req.file.originalname} ${(req.user.skills || []).join(" ")}`,
      existingSkills: req.user.skills || []
    });

    const resume = await Resume.create({
      student: req.user._id,
      resumeUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      ...analysis
    });

    await User.findByIdAndUpdate(req.user._id, {
      resumeUrl: uploadResult.secure_url,
      skills: Array.from(new Set([...(req.user.skills || []), ...analysis.extractedSkills]))
    });

    sendResponse(res, 201, "Resume uploaded and analyzed", resume);
  } catch (error) {
    next(error);
  }
};

exports.getResumeScore = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ student: req.user._id }).sort({ createdAt: -1 });
    if (!resume) return sendResponse(res, 404, "No resume found");
    sendResponse(res, 200, "Resume score fetched", resume);
  } catch (error) {
    next(error);
  }
};

const User = require("../models/usermodel");
const Resume = require("../models/resumemodel");
const sendResponse = require("../utils/response");
const { normalizeSkills } = require("../utils/validators");
const { calculateProfileScore, calculatePlacementScore } = require("../services/scoringservice");

exports.getProfile = async (req, res, next) => {
  try {
    // Students have profiles, admins don't
    if (req.user.role === "admin") {
      return sendResponse(res, 200, "Admin profile fetched", {
        user: req.user,
        message: "Admins manage jobs and applications, not student profiles"
      });
    }

    const latestResume = await Resume.findOne({ student: req.user._id }).sort({ createdAt: -1 });
    const scores = calculatePlacementScore({
      user: req.user,
      resumeScore: latestResume?.aiScore || 0
    });

    sendResponse(res, 200, "Profile fetched", {
      user: req.user,
      scores,
      profileCompletion: scores.profileScore
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    // Only students can update profiles
    if (req.user.role === "admin") {
      return sendResponse(res, 403, "Admins cannot update student profiles");
    }

    const allowedFields = ["name", "department", "rollNumber", "phone", "cgpa", "backlogs", "skills", "graduationYear"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.skills !== undefined) updates.skills = normalizeSkills(updates.skills);

    const profileScore = calculateProfileScore({ ...req.user.toObject(), ...updates });
    updates.profileScore = profileScore;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    sendResponse(res, 200, "Profile updated", { user, profileCompletion: profileScore });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    sendResponse(res, 200, "Users fetched", users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, 404, "User not found");
    sendResponse(res, 200, "User fetched", user);
  } catch (error) {
    next(error);
  }
};

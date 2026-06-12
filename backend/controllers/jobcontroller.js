const Job = require("../models/jobmodel");
const sendResponse = require("../utils/response");
const { normalizeSkills } = require("../utils/validators");

exports.createJob = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      requiredSkills: normalizeSkills(req.body.requiredSkills),
      createdBy: req.user._id
    };

    const job = await Job.create(payload);
    sendResponse(res, 201, "Job created", job);
  } catch (error) {
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const jobs = await Job.find(filter)
      .populate("company", "name website packages roles")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    sendResponse(res, 200, "Jobs fetched", jobs);
  } catch (error) {
    next(error);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("company");
    if (!job) return sendResponse(res, 404, "Job not found");
    sendResponse(res, 200, "Job fetched", job);
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.requiredSkills !== undefined) updates.requiredSkills = normalizeSkills(updates.requiredSkills);

    const job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!job) return sendResponse(res, 404, "Job not found");
    sendResponse(res, 200, "Job updated", job);
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return sendResponse(res, 404, "Job not found");
    sendResponse(res, 200, "Job deleted");
  } catch (error) {
    next(error);
  }
};

const Application = require("../models/applicationmodel");
const Job = require("../models/jobmodel");
const sendResponse = require("../utils/response");
const { checkEligibility } = require("../services/eligibilityservice");

exports.applyJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.body.jobId);
    if (!job) return sendResponse(res, 404, "Job not found");
    if (job.status !== "open") return sendResponse(res, 400, "Job is not open for applications");

    const eligibility = checkEligibility(req.user, job);
    if (!eligibility.eligible) {
      return sendResponse(res, 400, "You are not eligible for this job", eligibility);
    }

    const application = await Application.create({
      student: req.user._id,
      job: job._id,
      eligibility
    });

    sendResponse(res, 201, "Application submitted", application);
  } catch (error) {
    if (error.code === 11000) return sendResponse(res, 400, "You have already applied for this job");
    next(error);
  }
};

exports.myApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("job")
      .sort({ createdAt: -1 });

    sendResponse(res, 200, "Applications fetched", applications);
  } catch (error) {
    next(error);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate("student", "name email department rollNumber cgpa skills")
      .populate("job", "title companyName status")
      .sort({ createdAt: -1 });

    sendResponse(res, 200, "Applications fetched", applications);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes },
      { new: true, runValidators: true }
    );

    if (!application) return sendResponse(res, 404, "Application not found");
    sendResponse(res, 200, "Application status updated", application);
  } catch (error) {
    next(error);
  }
};

const Job = require("../models/jobmodel");
const sendResponse = require("../utils/response");
const { normalizeSkills } = require("../utils/validators");

exports.createJob = async (req, res, next) => {
  try {
    // Only admins can create jobs
    if (req.user.role !== "admin") {
      return sendResponse(res, 403, "Only company admins can create jobs");
    }

    // Admins can only create jobs for their own company
    if (!req.user.company) {
      return sendResponse(res, 400, "Admin user must be associated with a company");
    }

    const payload = {
      ...req.body,
      company: req.user.company,
      companyName: req.user.companyName,
      requiredSkills: normalizeSkills(req.body.requiredSkills),
      createdBy: req.user._id
    };

    const job = await Job.create(payload);
    await job.populate("company", "name website packages roles");
    
    sendResponse(res, 201, "Job created", job);
  } catch (error) {
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    let filter = req.query.status ? { status: req.query.status } : {};

    // If user is an admin, show only their company's jobs
    if (req.user.role === "admin" && req.user.company) {
      filter.company = req.user.company;
    }
    // If user is a student, show all open jobs
    else if (req.user.role === "student") {
      filter.status = "open";
    }

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

    // Students can view any open job, admins can view their company's jobs
    if (req.user.role === "student" && job.status !== "open") {
      return sendResponse(res, 403, "Job is not available for viewing");
    }

    const jobCompanyId = job.company ? (job.company._id || job.company).toString() : null;
    const userCompanyId = req.user.company ? (req.user.company._id || req.user.company).toString() : null;
    if (req.user.role === "admin" && jobCompanyId !== userCompanyId) {
      return sendResponse(res, 403, "You can only view jobs from your company");
    }

    sendResponse(res, 200, "Job fetched", job);
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    // Only admins can update jobs
    if (req.user.role !== "admin") {
      return sendResponse(res, 403, "Only company admins can update jobs");
    }

    const job = await Job.findById(req.params.id);
    if (!job) return sendResponse(res, 404, "Job not found");

    // Admins can only update their own company's jobs
    const jobCompanyId = job.company ? (job.company._id || job.company).toString() : null;
    const userCompanyId = req.user.company ? (req.user.company._id || req.user.company).toString() : null;
    if (jobCompanyId !== userCompanyId) {
      return sendResponse(res, 403, "You can only update jobs from your company");
    }

    const updates = { ...req.body };
    if (updates.requiredSkills !== undefined) updates.requiredSkills = normalizeSkills(updates.requiredSkills);
    // Don't allow company change
    delete updates.company;
    delete updates.companyName;

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    sendResponse(res, 200, "Job updated", updatedJob);
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    // Only admins can delete jobs
    if (req.user.role !== "admin") {
      return sendResponse(res, 403, "Only company admins can delete jobs");
    }

    const job = await Job.findById(req.params.id);
    if (!job) return sendResponse(res, 404, "Job not found");

    // Admins can only delete their own company's jobs
    const jobCompanyId = job.company ? (job.company._id || job.company).toString() : null;
    const userCompanyId = req.user.company ? (req.user.company._id || req.user.company).toString() : null;
    if (jobCompanyId !== userCompanyId) {
      return sendResponse(res, 403, "You can only delete jobs from your company");
    }

    await Job.findByIdAndDelete(req.params.id);
    sendResponse(res, 200, "Job deleted");
  } catch (error) {
    next(error);
  }
};

const Application = require("../models/applicationmodel");
const Job = require("../models/jobmodel");
const sendResponse = require("../utils/response");
const { checkEligibility } = require("../services/eligibilityservice");

exports.applyJob = async (req, res, next) => {
  try {
    // Only students can apply
    if (req.user.role !== "student") {
      return sendResponse(res, 403, "Only students can apply for jobs");
    }

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
    // Students can view their own applications
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
    let query = Application.find()
      .populate("student", "name email department rollNumber cgpa skills")
      .populate("job", "title companyName status company")
      .sort({ createdAt: -1 });

    // If user is an admin, show only applications for their company's jobs
    if (req.user.role === "admin") {
      if (!req.user.company) {
        return sendResponse(res, 400, "Admin user must be associated with a company");
      }

      // First get all jobs for this company
      const companyJobs = await Job.find({ company: req.user.company }).select("_id");
      const jobIds = companyJobs.map(job => job._id);

      // Then get applications for these jobs
      const applications = await Application.find({ job: { $in: jobIds } })
        .populate("student", "name email department rollNumber cgpa skills")
        .populate("job", "title companyName status company")
        .sort({ createdAt: -1 });

      return sendResponse(res, 200, "Applications fetched", applications);
    }

    // If user is a student, return error (students use myApplications instead)
    if (req.user.role === "student") {
      return sendResponse(res, 403, "Use /myApplications endpoint to view your applications");
    }

    const applications = await query.exec();
    sendResponse(res, 200, "Applications fetched", applications);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    // Only admins can update application status
    if (req.user.role !== "admin") {
      return sendResponse(res, 403, "Only company admins can update application status");
    }

    if (!req.user.company) {
      return sendResponse(res, 400, "Admin user must be associated with a company");
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return sendResponse(res, 404, "Application not found");

    // Check if this application is for the admin's company
    const jobCompanyId = application.job.company ? (application.job.company._id || application.job.company).toString() : null;
    const userCompanyId = req.user.company ? (req.user.company._id || req.user.company).toString() : null;
    if (jobCompanyId !== userCompanyId) {
      return sendResponse(res, 403, "You can only manage applications for your company's jobs");
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes },
      { new: true, runValidators: true }
    );

    sendResponse(res, 200, "Application status updated", updatedApplication);
  } catch (error) {
    next(error);
  }
};

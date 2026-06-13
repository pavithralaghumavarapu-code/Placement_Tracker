const Interview = require("../models/interviewmodel");
const Application = require("../models/applicationmodel");
const Job = require("../models/jobmodel");
const sendResponse = require("../utils/response");

exports.scheduleInterview = async (req, res, next) => {
  try {
    // Only admins can schedule interviews
    if (req.user.role !== "admin") {
      return sendResponse(res, 403, "Only company admins can schedule interviews");
    }

    if (!req.user.company) {
      return sendResponse(res, 400, "Admin not associated with a company");
    }

    const application = await Application.findById(req.body.applicationId).populate("job");
    if (!application) return sendResponse(res, 404, "Application not found");

    // Verify this application belongs to admin's company
    const jobCompanyId = application.job.company ? (application.job.company._id || application.job.company).toString() : null;
    const userCompanyId = req.user.company ? (req.user.company._id || req.user.company).toString() : null;
    if (jobCompanyId !== userCompanyId) {
      return sendResponse(res, 403, "You can only schedule interviews for your company's applications");
    }

    // Application must be shortlisted to schedule interview
    if (application.status !== "shortlisted") {
      return sendResponse(res, 400, "Can only schedule interviews for shortlisted candidates");
    }

    if (!req.body.interviewDate || !req.body.round) {
      return sendResponse(res, 400, "Interview date and round are required");
    }

    const interview = await Interview.create({
      application: application._id,
      student: application.student,
      job: application.job,
      interviewDate: req.body.interviewDate,
      round: req.body.round,
      feedback: req.body.feedback || ""
    });

    await interview.populate([
      { path: "student", select: "name email department" },
      { path: "job", select: "title companyName" },
      { path: "application", select: "status" }
    ]);

    sendResponse(res, 201, "Interview scheduled", interview);
  } catch (error) {
    next(error);
  }
};

exports.updateInterview = async (req, res, next) => {
  try {
    // Only admins can update interviews
    if (req.user.role !== "admin") {
      return sendResponse(res, 403, "Only company admins can update interviews");
    }

    if (!req.user.company) {
      return sendResponse(res, 400, "Admin not associated with a company");
    }

    const interview = await Interview.findById(req.params.id).populate("job");
    if (!interview) return sendResponse(res, 404, "Interview not found");

    // Verify interview belongs to admin's company
    const jobCompanyId = interview.job.company ? (interview.job.company._id || interview.job.company).toString() : null;
    const userCompanyId = req.user.company ? (req.user.company._id || req.user.company).toString() : null;
    if (jobCompanyId !== userCompanyId) {
      return sendResponse(res, 403, "You can only update interviews for your company");
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      {
        feedback: req.body.feedback,
        round: req.body.round,
        interviewDate: req.body.interviewDate || interview.interviewDate
      },
      { new: true, runValidators: true }
    );

    await updatedInterview.populate([
      { path: "student", select: "name email department" },
      { path: "job", select: "title companyName" },
      { path: "application", select: "status" }
    ]);

    sendResponse(res, 200, "Interview updated", updatedInterview);
  } catch (error) {
    next(error);
  }
};

exports.getInterviews = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === "student") {
      // Students see only their interviews
      query.student = req.user._id;
    } else if (req.user.role === "admin") {
      // Admins see interviews for their company's jobs
      if (!req.user.company) {
        return sendResponse(res, 400, "Admin not associated with a company");
      }

      // Get all jobs for this company
      const companyJobs = await Job.find({ company: req.user.company }).select("_id");
      const jobIds = companyJobs.map(job => job._id);
      query.job = { $in: jobIds };
    }

    const interviews = await Interview.find(query)
      .populate("student", "name email department rollNumber cgpa")
      .populate("job", "title companyName role")
      .populate("application", "status eligibility")
      .sort({ interviewDate: 1 });

    sendResponse(res, 200, "Interviews fetched", interviews);
  } catch (error) {
    next(error);
  }
};

exports.getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("student", "name email department rollNumber cgpa skills")
      .populate("job", "title companyName role salary location")
      .populate("application", "status eligibility notes");

    if (!interview) return sendResponse(res, 404, "Interview not found");

    // Check authorization
    if (req.user.role === "student" && interview.student.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, "You can only view your own interviews");
    }

    if (req.user.role === "admin") {
      if (!req.user.company) {
        return sendResponse(res, 400, "Admin not associated with a company");
      }
      const jobCompanyId = interview.job.company ? (interview.job.company._id || interview.job.company).toString() : null;
      const userCompanyId = req.user.company ? (req.user.company._id || req.user.company).toString() : null;
      if (jobCompanyId !== userCompanyId) {
        return sendResponse(res, 403, "You can only view interviews for your company");
      }
    }

    sendResponse(res, 200, "Interview fetched", interview);
  } catch (error) {
    next(error);
  }
};

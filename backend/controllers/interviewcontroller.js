const Interview = require("../models/interviewmodel");
const Application = require("../models/applicationmodel");
const sendResponse = require("../utils/response");

exports.scheduleInterview = async (req, res, next) => {
  try {
    const application = await Application.findById(req.body.applicationId);
    if (!application) return sendResponse(res, 404, "Application not found");

    const interview = await Interview.create({
      application: application._id,
      student: application.student,
      job: application.job,
      interviewDate: req.body.interviewDate,
      round: req.body.round,
      feedback: req.body.feedback
    });

    sendResponse(res, 201, "Interview scheduled", interview);
  } catch (error) {
    next(error);
  }
};

exports.updateRound = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!interview) return sendResponse(res, 404, "Interview not found");
    sendResponse(res, 200, "Interview updated", interview);
  } catch (error) {
    next(error);
  }
};

exports.getInterviews = async (req, res, next) => {
  try {
    const filter = req.user.role === "student" ? { student: req.user._id } : {};
    const interviews = await Interview.find(filter)
      .populate("student", "name email department rollNumber")
      .populate("job", "title companyName")
      .populate("application", "status")
      .sort({ interviewDate: 1 });

    sendResponse(res, 200, "Interviews fetched", interviews);
  } catch (error) {
    next(error);
  }
};

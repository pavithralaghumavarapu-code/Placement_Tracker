const Company = require("../models/companymodel");
const sendResponse = require("../utils/response");

// Companies are auto-created when admin registers
// This endpoint is for viewing company info only

exports.getCompany = async (req, res, next) => {
  try {
    // Admin can only view their own company
    if (req.user.role === "admin") {
      if (!req.user.company) {
        return sendResponse(res, 400, "Admin not associated with a company");
      }
      const company = await Company.findById(req.user.company);
      if (!company) return sendResponse(res, 404, "Company not found");
      return sendResponse(res, 200, "Company fetched", company);
    }

    // If ID is provided, anyone can view public company info
    const company = await Company.findById(req.params.id);
    if (!company) return sendResponse(res, 404, "Company not found");
    sendResponse(res, 200, "Company fetched", company);
  } catch (error) {
    next(error);
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    sendResponse(res, 200, "Companies fetched", companies);
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return sendResponse(res, 403, "Only admins can update company details");
    }
    if (!req.user.company) {
      return sendResponse(res, 400, "Admin not associated with a company");
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.user.company,
      req.body,
      { new: true, runValidators: true }
    );
    
    sendResponse(res, 200, "Company updated", updatedCompany);
  } catch (error) {
    next(error);
  }
};

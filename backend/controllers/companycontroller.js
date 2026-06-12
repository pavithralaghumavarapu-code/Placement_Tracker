const Company = require("../models/companymodel");
const sendResponse = require("../utils/response");

exports.addCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    sendResponse(res, 201, "Company added", company);
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
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!company) return sendResponse(res, 404, "Company not found");
    sendResponse(res, 200, "Company updated", company);
  } catch (error) {
    next(error);
  }
};

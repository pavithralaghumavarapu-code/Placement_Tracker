const User = require("../models/usermodel");
const Company = require("../models/companymodel");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sendResponse = require("../utils/response");
const { isEmail, isStrongPassword } = require("../utils/validators");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;

    if (!name || !email || !password) {
      return sendResponse(res, 400, "Name, email and password are required");
    }

    if (!isEmail(email)) {
      return sendResponse(res, 400, "Please provide a valid email");
    }

    if (!isStrongPassword(password)) {
      return sendResponse(res, 400, "Password must be at least 6 characters");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    sendResponse(res, 201, "User registered successfully", { token, user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Company Admin Registration
exports.registerCompanyAdmin = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password) {
      return sendResponse(res, 400, "Name, email, and password are required");
    }

    if (!isEmail(email)) {
      return sendResponse(res, 400, "Please provide a valid email");
    }

    if (!isStrongPassword(password)) {
      return sendResponse(res, 400, "Password must be at least 6 characters");
    }

    // Use provided companyName or default to admin name
    const finalCompanyName = companyName || name;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, "Email already registered");
    }

    // Check if company already exists with this email
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return sendResponse(res, 400, "Company with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company with minimal info - company name defaults to admin name
    const company = await Company.create({
      name: finalCompanyName,
      email: email
    });

    // Create admin user linked to company
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      company: company._id,
      companyName: finalCompanyName
    });

    // Update company with admin user reference
    company.adminUser = user._id;
    await company.save();

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    sendResponse(res, 201, "Company admin registered successfully", { 
      token, 
      user: user.toJSON(),
      company
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password").populate("company");
    if (!user) {
      return sendResponse(res, 400, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 400, "Invalid credentials");
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    sendResponse(res, 200, "Login successful", { token, user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  sendResponse(res, 200, "Logged out successfully");
};

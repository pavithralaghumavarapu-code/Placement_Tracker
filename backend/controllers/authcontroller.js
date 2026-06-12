const User = require("../models/usermodel");
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
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

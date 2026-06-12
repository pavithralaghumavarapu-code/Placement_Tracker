const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = req.cookies.token || authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, message: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = authMiddleware;

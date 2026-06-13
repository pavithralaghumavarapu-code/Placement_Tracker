const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");
const {
  getProfile,
  updateProfile,
  getUsers,
  getUserById
} = require("../controllers/usercontroller");

const router = express.Router();

// GET routes
router.get("/profile", authMiddleware, getProfile);
router.get("/get-users", authMiddleware, roleMiddleware("admin"), getUsers);
router.get("/:id", authMiddleware, roleMiddleware("admin"), getUserById);

// PUT routes
router.put("/profile", authMiddleware, updateProfile);
router.put("/update-profile", authMiddleware, updateProfile);

module.exports = router;

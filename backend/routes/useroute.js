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

router.get("/profile", authMiddleware, getProfile);
router.put("/update-profile", authMiddleware, updateProfile);
router.get("/get-users", authMiddleware, roleMiddleware("admin"), getUsers);
router.get("/:id", authMiddleware, roleMiddleware("admin"), getUserById);

module.exports = router;

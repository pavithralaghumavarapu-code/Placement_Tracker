const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");
const {
  scheduleInterview,
  updateInterview,
  getInterviews,
  getInterviewById
} = require("../controllers/interviewcontroller");

const router = express.Router();

// POST routes
router.post("/", authMiddleware, roleMiddleware("admin"), scheduleInterview);
router.post("/schedule-interview", authMiddleware, roleMiddleware("admin"), scheduleInterview);

// GET routes
router.get("/", authMiddleware, getInterviews);
router.get("/get-interviews", authMiddleware, getInterviews);
router.get("/:id", authMiddleware, getInterviewById);

// PUT routes
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateInterview);
router.put("/update-interview/:id", authMiddleware, roleMiddleware("admin"), updateInterview);

module.exports = router;

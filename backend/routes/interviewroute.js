const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");
const {
  scheduleInterview,
  updateRound,
  getInterviews
} = require("../controllers/interviewcontroller");

const router = express.Router();

router.post("/schedule-interview", authMiddleware, roleMiddleware("admin"), scheduleInterview);
router.put("/update-round/:id", authMiddleware, roleMiddleware("admin"), updateRound);
router.get("/get-interviews", authMiddleware, getInterviews);

module.exports = router;

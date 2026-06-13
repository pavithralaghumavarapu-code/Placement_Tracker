const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");
const {
  applyJob,
  myApplications,
  getApplications,
  updateStatus
} = require("../controllers/applicationcontroller");

const router = express.Router();

// POST routes
router.post("/apply", authMiddleware, roleMiddleware("student"), applyJob);
router.post("/apply-job", authMiddleware, roleMiddleware("student"), applyJob);

// GET routes
router.get("/my", authMiddleware, roleMiddleware("student"), myApplications);
router.get("/my-applications", authMiddleware, roleMiddleware("student"), myApplications);
router.get("/", authMiddleware, getApplications);
router.get("/get-applications", authMiddleware, roleMiddleware("admin"), getApplications);

// PUT routes
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateStatus);
router.put("/update-status/:id", authMiddleware, roleMiddleware("admin"), updateStatus);

module.exports = router;

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

router.post("/apply-job", authMiddleware, roleMiddleware("student"), applyJob);
router.get("/my-applications", authMiddleware, roleMiddleware("student"), myApplications);
router.get("/get-applications", authMiddleware, roleMiddleware("admin"), getApplications);
router.put("/update-status/:id", authMiddleware, roleMiddleware("admin"), updateStatus);

module.exports = router;

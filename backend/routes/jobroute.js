const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} = require("../controllers/jobcontroller");

const router = express.Router();

router.post("/create-job", authMiddleware, roleMiddleware("admin"), createJob);
router.get("/get-jobs", authMiddleware, getJobs);
router.get("/:id", authMiddleware, getJobById);
router.put("/update-job/:id", authMiddleware, roleMiddleware("admin"), updateJob);
router.delete("/delete-job/:id", authMiddleware, roleMiddleware("admin"), deleteJob);

module.exports = router;

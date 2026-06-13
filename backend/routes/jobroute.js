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

// POST routes
router.post("/", authMiddleware, roleMiddleware("admin"), createJob);
router.post("/create-job", authMiddleware, roleMiddleware("admin"), createJob);

// GET routes
router.get("/", authMiddleware, getJobs);
router.get("/get-jobs", authMiddleware, getJobs);
router.get("/:id", authMiddleware, getJobById);

// PUT routes
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateJob);
router.put("/update-job/:id", authMiddleware, roleMiddleware("admin"), updateJob);

// DELETE routes
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteJob);
router.delete("/delete-job/:id", authMiddleware, roleMiddleware("admin"), deleteJob);

module.exports = router;

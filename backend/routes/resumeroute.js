const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const upload = require("../middleware/uploadmiddleware");
const {
  uploadResume,
  getResumeScore
} = require("../controllers/resumecontroller");

const router = express.Router();

// POST routes
router.post("/", authMiddleware, upload.single("resume"), uploadResume);
router.post("/upload-resume", authMiddleware, upload.single("resume"), uploadResume);

// GET routes
router.get("/", authMiddleware, getResumeScore);
router.get("/get-resume-score", authMiddleware, getResumeScore);

module.exports = router;

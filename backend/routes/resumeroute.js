const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const upload = require("../middleware/uploadmiddleware");
const {
  uploadResume,
  getResumeScore
} = require("../controllers/resumecontroller");

const router = express.Router();

router.post("/upload-resume", authMiddleware, upload.single("resume"), uploadResume);
router.get("/get-resume-score", authMiddleware, getResumeScore);

module.exports = router;

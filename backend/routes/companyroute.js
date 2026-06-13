const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const {
  getCompany,
  getCompanies,
  updateCompany
} = require("../controllers/companycontroller");

const router = express.Router();

// PUT routes
router.put("/update-company", authMiddleware, updateCompany);

// GET routes - support multiple naming conventions
router.get("/my-company", authMiddleware, getCompany);
router.get("/get-companies", authMiddleware, getCompanies);
router.get("/", authMiddleware, getCompanies);
router.get("/:id", authMiddleware, getCompany);

module.exports = router;

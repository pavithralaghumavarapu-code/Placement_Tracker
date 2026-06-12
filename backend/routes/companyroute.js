const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");
const {
  addCompany,
  getCompanies,
  updateCompany
} = require("../controllers/companycontroller");

const router = express.Router();

router.post("/add-company", authMiddleware, roleMiddleware("admin"), addCompany);
router.get("/get-companies", authMiddleware, getCompanies);
router.put("/update-company/:id", authMiddleware, roleMiddleware("admin"), updateCompany);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  register,
  registerCompanyAdmin,
  login,
  logout
} = require("../controllers/authcontroller");

router.post("/register", register);
router.post("/register-company-admin", registerCompanyAdmin);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;

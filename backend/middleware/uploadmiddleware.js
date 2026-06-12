const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("Only PDF, PNG and JPG files are allowed"));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

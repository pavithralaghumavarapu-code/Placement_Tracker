const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/errormiddleware");

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001"
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/authroute"));
app.use("/api/users", require("./routes/useroute"));
app.use("/api/jobs", require("./routes/jobroute"));
app.use("/api/companies", require("./routes/companyroute"));
app.use("/api/applications", require("./routes/applicationroute"));
app.use("/api/interviews", require("./routes/interviewroute"));
app.use("/api/resumes", require("./routes/resumeroute"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Placement Tracker API Running"
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });

module.exports = app;

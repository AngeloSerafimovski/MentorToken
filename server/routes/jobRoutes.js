const express = require("express");

const router = express.Router();

const {
  createJob,
  getMyJobs,
  getJobFeed,
  getJobById,
} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Site Jobs ruti baraat najaven korisnik
router.use(authMiddleware);

// Mentorot mozhe da gi vidi site otvoreni raboti
router.get(
  "/feed",
  roleMiddleware("mentor"),
  getJobFeed
);

// Startupot mozhe da kreira nova rabota
router.post(
  "/",
  roleMiddleware("startup"),
  createJob
);

// Startupot gi gleda svoite raboti
router.get(
  "/my-jobs",
  roleMiddleware("startup"),
  getMyJobs
);

// Startupot gleda konkretna svoja rabota
router.get(
  "/:id",
  roleMiddleware("startup"),
  getJobById
);

module.exports = router;
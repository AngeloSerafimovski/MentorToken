const express = require("express");

const router = express.Router();

const {
  createJob,
  getMyJobs,
  getJobFeed,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Site Jobs ruti baraat najaven korisnik
router.use(authMiddleware);

// Mentorot moze da gi vidi site otvoreni raboti
router.get(
  "/feed",
  roleMiddleware("mentor"),
  getJobFeed
);

// Startupot moze da kreira nova rabota
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

// Startupot moze da izmeni svoja rabota
router.patch(
  "/:id",
  roleMiddleware("startup"),
  updateJob
);

// Startupot moze da izbrise svoja rabota
router.delete(
  "/:id",
  roleMiddleware("startup"),
  deleteJob
);

module.exports = router;
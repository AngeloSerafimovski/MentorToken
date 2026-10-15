const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getOverviewStatistics,
} = require("../controllers/statisticsController");

const router = express.Router();

// Statistika za najaveniot korisnik
router.get(
  "/overview",
  authMiddleware,
  getOverviewStatistics
);

module.exports = router;
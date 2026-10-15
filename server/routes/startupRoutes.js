const express = require("express");

const router = express.Router();

const {
  getAllStartups,
} = require("../controllers/startupController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Site ruti baraat najaven korisnik
router.use(authMiddleware);

// Samo mentorite mozat da prebaruvaat startup kompanii
router.use(roleMiddleware("mentor"));

// Prezemi gi site registrirani startup kompanii
router.get("/", getAllStartups);

module.exports = router;
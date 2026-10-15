const express = require("express");

const router = express.Router();

const {
  getAllMentors,
  getMyMentors,
  addMentor,
  getMentorById,
} = require("../controllers/mentorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Site ruti baraat najaven korisnik
router.use(authMiddleware);

// Samo startup korisnici mozat da pristapat do ovie ruti
router.use(roleMiddleware("startup"));

// Prezemanje na site registrirani mentori
router.get("/", getAllMentors);

// Prezemanje na mentorite dodadeni od najaveniot startup
router.get("/my", getMyMentors);

// Dodavanje mentor vo listata na startupot
router.post("/add", addMentor);

// Prezemanje na konkreten mentor spored ID
router.get("/:mentorId", getMentorById);

module.exports = router;
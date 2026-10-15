const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
  register,
  login,
  updateMentorProfile,
  updateProfilePicture,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// REGISTRACIJA
router.post(
  "/register",
  upload.single("profilePicture"),
  register
);

// LOGIN
router.post("/login", login);

// PODATOCI ZA NAJAVENIOT KORISNIK
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

// AZHURIRANJE NA MENTOR PROFIL
router.patch(
  "/profile",
  authMiddleware,
  roleMiddleware("mentor"),
  updateMentorProfile
);

// PROMENA NA PROFILNA SLIKA
// Dostapno za Startup i Mentor
router.patch(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfilePicture
);

// TEST RUTA ZA STARTUP
router.get(
  "/startup-only",
  authMiddleware,
  roleMiddleware("startup"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome startup user!",
    });
  }
);

module.exports = router;
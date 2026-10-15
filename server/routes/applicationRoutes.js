const express = require("express");

const router = express.Router();

const {
  applyToJob,
  sendJobOffer,
  getJobApplications,
  getMyApplications,
  respondToApplication,
  cancelJobOffer,
  completeJob,
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Site application ruti baraat najaven korisnik
router.use(authMiddleware);

// MENTOR: Apliciranje na otvorena rabotna pozicija
router.post(
  "/apply/:jobId",
  roleMiddleware("mentor"),
  applyToJob
);

// STARTUP: Isprakjanje direktna ponuda do mentor
router.post(
  "/offer",
  roleMiddleware("startup"),
  sendJobOffer
);

// STARTUP: Pregled na aplikaciite za konkretna rabotna pozicija
router.get(
  "/job/:jobId",
  roleMiddleware("startup"),
  getJobApplications
);

// STARTUP I MENTOR: Pregled na sopstvenite aplikacii i ponudi
router.get(
  "/my",
  getMyApplications
);

// STARTUP I MENTOR: Prifakjanje ili odbivanje aplikacija ili ponuda
router.patch(
  "/:id/respond",
  respondToApplication
);

// STARTUP: Otkazhuvanje prethodno ispratena ponuda
router.patch(
  "/:id/cancel",
  roleMiddleware("startup"),
  cancelJobOffer
);

// MENTOR: Oznachuvanje na prifaten angazhman kako zavrshen
router.patch(
  "/:id/complete",
  roleMiddleware("mentor"),
  completeJob
);

module.exports = router;
const express = require("express");

const { sendContactMessage } = require("../controllers/contactController");

const router = express.Router();

// Javna ruta - ne e potrebna najava
router.post("/", sendContactMessage);

module.exports = router;
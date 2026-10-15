const Contact = require("../models/Contact");

// Primanje i zachuvuvanje kontakt poraka
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Proverka dali se popolneti site polinja
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Osnovna validacija na email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // Zachuvuvanje vo MongoDB
    await Contact.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    console.error("Contact message error:", error);

    return res.status(500).json({
      message: "Failed to send your message. Please try again.",
    });
  }
};

module.exports = {
  sendContactMessage,
};
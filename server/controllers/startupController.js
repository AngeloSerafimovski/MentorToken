const User = require("../models/User");

// PREZEMANJE NA SITE REGISTRIRANI STARTUP KOMPANII
// GET /api/startups
const getAllStartups = async (req, res) => {
  try {
    const startups = await User.find({
      role: "startup",
    })
      .select("_id startupName profilePicture")
      .sort({ startupName: 1 });

    return res.status(200).json(startups);
  } catch (error) {
    console.error("Get startups error:", error);

    return res.status(500).json({
      message: "Server error while fetching startups",
    });
  }
};

module.exports = {
  getAllStartups,
};
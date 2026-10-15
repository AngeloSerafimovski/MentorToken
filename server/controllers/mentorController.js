const mongoose = require("mongoose");
const User = require("../models/User");

// PREZEMANJE NA SITE REGISTRIRANI MENTORI
// GET /api/mentors
const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({
      role: "mentor",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(mentors);
  } catch (error) {
    console.error("Get mentors error:", error);

    return res.status(500).json({
      message: "Server error while fetching mentors",
    });
  }
};

// PREZEMANJE NA MENTORITE DODADENI OD NAJAVENIOT STARTUP
// GET /api/mentors/my
const getMyMentors = async (req, res) => {
  try {
    // Go pronagjame najaveniot startup vo MongoDB
    const startup = await User.findOne({
      _id: req.user._id,
      role: "startup",
    }).populate({
      path: "addedMentors",
      match: { role: "mentor" },
      select: "-password -addedMentors",
    });

    if (!startup) {
      return res.status(404).json({
        message: "Startup not found",
      });
    }

    // Gi vrakjame samo mentorite dodadeni od ovoj startup
    return res.status(200).json(
      startup.addedMentors.filter(Boolean)
    );
  } catch (error) {
    console.error("Get my mentors error:", error);

    return res.status(500).json({
      message: "Server error while fetching your mentors",
    });
  }
};

// DODAVANJE MENTOR VO LISTATA NA NAJAVENIOT STARTUP
// POST /api/mentors/add
const addMentor = async (req, res) => {
  try {
    const { mentorId } = req.body || {};

    // Proverka dali ID-to na mentorot e validno
    if (
      !mentorId ||
      !mongoose.Types.ObjectId.isValid(mentorId)
    ) {
      return res.status(400).json({
        message: "Invalid mentor ID",
      });
    }

    // Proverka dali mentorot postoi vo MongoDB
    const mentor = await User.findOne({
      _id: mentorId,
      role: "mentor",
    }).select("-password -addedMentors");

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found",
      });
    }

    // Go pronagjame najaveniot startup
    const startup = await User.findOne({
      _id: req.user._id,
      role: "startup",
    });

    if (!startup) {
      return res.status(404).json({
        message: "Startup not found",
      });
    }

    // Proverka dali mentorot vekje e dodaden
    const alreadyAdded = startup.addedMentors.some(
      (id) => id.toString() === mentorId.toString()
    );

    if (alreadyAdded) {
      return res.status(409).json({
        message: "This mentor is already in your list",
      });
    }

    // Go dodavame mentorot vo listata na startupot
    startup.addedMentors.push(mentor._id);

    // Gi zachuvuvame promenite vo MongoDB
    await startup.save();

    return res.status(201).json({
      message: "Mentor added successfully",
      mentor,
    });
  } catch (error) {
    console.error("Add mentor error:", error);

    return res.status(500).json({
      message: "Server error while adding mentor",
    });
  }
};

// PREZEMANJE NA KONKRETEN MENTOR SPORED ID
// GET /api/mentors/:mentorId
const getMentorById = async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Proverka dali ID-to e validno
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        message: "Invalid mentor ID",
      });
    }

    // Go pronagjame mentorot vo MongoDB
    const mentor = await User.findOne({
      _id: mentorId,
      role: "mentor",
    }).select("-password -addedMentors");

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found",
      });
    }

    return res.status(200).json(mentor);
  } catch (error) {
    console.error("Get mentor error:", error);

    return res.status(500).json({
      message: "Server error while fetching mentor",
    });
  }
};

module.exports = {
  getAllMentors,
  getMyMentors,
  addMentor,
  getMentorById,
};
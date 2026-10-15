const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const {
  email,
  password,
  accountType,
  startupName,
  legalRepresentative,
  businessAddress,
  mentorEmail,
  firstName,
  lastName,
  phone,
  skills,
  description,
} = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
  email,
  password: hashedPassword,
  role: accountType,
  startupName,
  legalRepresentative,
  businessAddress,
  mentorEmail,
  firstName,
  lastName,
  phone,
  skills,
  description,
  profilePicture: req.file
  ? `/uploads/${req.file.filename}`
  : "",
});

    const token = generateToken(user._id, user.role);

   res.status(201).json({
  message: "User registered successfully",
  token,
  user: {
    id: user._id,
    email: user.email,
    role: user.role,
    startupName: user.startupName,
    firstName: user.firstName,
    lastName: user.lastName,
    skills: user.skills,
    profilePicture: user.profilePicture,
  },
});
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    email: user.email,
    role: user.role,

    // Startup podatoci
    startupName: user.startupName,

    // Mentor podatoci
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    skills: user.skills,
    description: user.description,
    profilePicture: user.profilePicture,
  },
});
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// AZHURIRANJE NA PROFILOT NA NAJAVENIOT MENTOR
// PATCH /api/auth/profile
const updateMentorProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, skills, description } = req.body;

    // Proverka dali najaveniot korisnik e mentor
    if (req.user.role !== "mentor") {
      return res.status(403).json({
        message: "Only mentors can update their profile",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Gi azhurirame samo ispratenite polinja
    if (firstName !== undefined) {
      user.firstName = firstName;
    }

    if (lastName !== undefined) {
      user.lastName = lastName;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (skills !== undefined) {
      user.skills = skills;
    }

    if (description !== undefined) {
      user.description = description;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        skills: user.skills,
        description: user.description,
      },
    });
  } catch (error) {
    console.error("Update mentor profile error:", error);

    return res.status(500).json({
      message: "Server error while updating profile",
    });
  }
};

// PROMENA NA PROFILNA SLIKA
// PATCH /api/auth/profile-picture
const updateProfilePicture = async (req, res) => {
  try {
    // Proveruvame dali korisnikot izbral slika
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a profile picture.",
      });
    }

    // Go pronajduvame najaveniot korisnik
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Ja zachuvuvame patekatа do novata slika
    user.profilePicture = `/uploads/${req.file.filename}`;

    await user.save();

    return res.status(200).json({
      message: "Profile picture updated successfully.",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Update profile picture error:", error);

    return res.status(500).json({
      message: "Failed to update profile picture.",
    });
  }
};


module.exports = {
  register,
  login,
  updateMentorProfile,
  updateProfilePicture,
};
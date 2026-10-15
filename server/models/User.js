const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["startup", "mentor"],
      required: true,
    },

    // Profilna slika na korisnikot
profilePicture: {
  type: String,
  default: "",
},

    // PODATOCI ZA STARTUP
    startupName: {
      type: String,
      trim: true,
    },

    legalRepresentative: {
      type: String,
      trim: true,
    },

    businessAddress: {
      type: String,
      trim: true,
    },

    mentorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Lista na mentori dodadeni od startupot
    addedMentors: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    // PODATOCI ZA MENTOR
    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Job",
  default: null,
  required: true,
},

    jobName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },

    offerDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicationType: {
      type: String,
      enum: ["mentorToCompany", "companyToMentor"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },

    acceptedStatus: {
      type: String,
      enum: ["in progress", "done", "rejected"],
      default: "in progress",
    },
    // Datum koga angazhmanot e prifaten
acceptedAt: {
  type: Date,
  default: null,
},

// Datum koga angazhmanot e zavrshen
completedAt: {
  type: Date,
  default: null,
},
  },

  {
    timestamps: true,
  }
);

// Sprechuvanje duplikat aplikacii za ista javna rabotna pozicija
applicationSchema.index(
  {
    jobId: 1,
    mentorId: 1,
    applicationType: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      applicationType: "mentorToCompany",
    },
  }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

module.exports = Application;
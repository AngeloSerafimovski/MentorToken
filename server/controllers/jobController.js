const mongoose = require("mongoose");
const Job = require("../models/Job");
const Application = require("../models/Application");

// CREATE JOB
// POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, description, skillsRequired } = req.body;

    // Proverka na zadolzhitelnite polinja
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Job title and description are required",
      });
    }

    // Proverka na potrebnite veshtini
    if (
      !Array.isArray(skillsRequired) ||
      skillsRequired.length === 0 ||
      !skillsRequired.every(
        (skill) => typeof skill === "string" && skill.trim()
      )
    ) {
      return res.status(400).json({
        message: "At least one valid skill is required",
      });
    }

    // Kreiranje na nova zadacha
    const job = await Job.create({
      companyId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      skillsRequired: skillsRequired.map((skill) => skill.trim()),
      status: "Open",
    });

    return res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    return res.status(500).json({
      message: "Server error while creating job",
    });
  }
};

// GET MY JOBS
// GET /api/jobs/my-jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
  companyId: req.user._id,
})
  .populate("companyId", "startupName profilePicture")
  .sort({ createdAt: -1 });

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Get my jobs error:", error);

    return res.status(500).json({
      message: "Server error while fetching jobs",
    });
  }
};

// GET JOB FEED
// GET /api/jobs/feed
const getJobFeed = async (req, res) => {
  try {
    // Gi prezemame site javno otvoreni raboti
    const jobs = await Job.find({
      status: "Open",
    })
      .populate("companyId", "startupName profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Get job feed error:", error);

    return res.status(500).json({
      message: "Server error while fetching job feed",
    });
  }
};

// GET JOB BY ID
// GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

   const job = await Job.findOne({
  _id: id,
  companyId: req.user._id,
}).populate("companyId", "startupName profilePicture");

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.error("Get job error:", error);

    return res.status(500).json({
      message: "Server error while fetching job",
    });
  }
};

// UPDATE JOB
// PATCH /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, skillsRequired } = req.body || {};

    // Proverka na Job ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    // Go barame Job samo ako pripagja na najaveniot Startup
    const job = await Job.findOne({
      _id: id,
      companyId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Dozvoluvame izmeni samo na otvoreni Jobs
    if (job.status !== "Open") {
      return res.status(400).json({
        message: "Only open jobs can be updated",
      });
    }

    // Ne dozvoluvame izmeni ako vekje ima aplikacii
    const hasApplications = await Application.exists({
      jobId: job._id,
    });

    if (hasApplications) {
      return res.status(409).json({
        message: "Cannot update a job that has applications",
      });
    }

    // Validacija na dozvolenite polinja
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Job title and description are required",
      });
    }

    if (
      !Array.isArray(skillsRequired) ||
      skillsRequired.length === 0 ||
      !skillsRequired.every(
        (skill) => typeof skill === "string" && skill.trim()
      )
    ) {
      return res.status(400).json({
        message: "At least one valid skill is required",
      });
    }

    // Gi azhurirame podatocite
    job.title = title.trim();
    job.description = description.trim();
    job.skillsRequired = skillsRequired.map((skill) =>
      skill.trim()
    );

    await job.save();

    return res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("Update job error:", error);

    return res.status(500).json({
      message: "Server error while updating job",
    });
  }
};

// DELETE JOB
// DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Proverka na Job ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    // Go barame Job samo ako pripagja na najaveniot Startup
    const job = await Job.findOne({
      _id: id,
      companyId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Dozvoluvame brisenje samo na otvoreni Jobs
    if (job.status !== "Open") {
      return res.status(400).json({
        message: "Only open jobs can be deleted",
      });
    }

    // Ne dozvoluvame brisenje ako postojat aplikacii
    const hasApplications = await Application.exists({
      jobId: job._id,
    });

    if (hasApplications) {
      return res.status(409).json({
        message: "Cannot delete a job that has applications",
      });
    }

    // Brisenje od MongoDB
    await job.deleteOne();

    return res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    return res.status(500).json({
      message: "Server error while deleting job",
    });
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getJobFeed,
  getJobById,
  updateJob,
  deleteJob,
};
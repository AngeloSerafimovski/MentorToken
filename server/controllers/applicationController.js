const mongoose = require("mongoose");

const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

// MENTOROT APLICIRA ZA OTVORENA RABOTNA POZICIJA
// POST /api/applications/apply/:jobId
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (job.status !== "Open") {
      return res.status(409).json({
        message: "This job is no longer accepting applications",
      });
    }

    // Proverka dali mentorot vekje apliciral
    const existingApplication = await Application.findOne({
      jobId,
      mentorId: req.user._id,
      applicationType: "mentorToCompany",
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied to this job",
      });
    }

    const application = await Application.create({
      jobId,
      companyId: job.companyId,
      mentorId: req.user._id,
      applicationType: "mentorToCompany",
      status: "pending",
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied to this job",
      });
    }

    console.error("Apply to job error:", error);

    return res.status(500).json({
      message: "Server error while submitting application",
    });
  }
};

// STARTUP ISPRAKJA DIREKTNA PONUDA DO MENTOR
// POST /api/applications/offer
//
// Poddrzuva:
// 1. Postoecki Job preku jobId
// 2. Nov Job preku newJob
const sendJobOffer = async (req, res) => {
  const {
    mentorId,
    jobId,
    newJob,
    offerDescription = "",
  } = req.body || {};

  // VALIDACIJA NA MENTOR
  if (!mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).json({
      message: "Invalid mentor ID",
    });
  }

  // VALIDACIJA NA OPISOT NA PONUDATA
  if (
    typeof offerDescription !== "string" ||
    offerDescription.trim().length > 1000
  ) {
    return res.status(400).json({
      message: "Offer description must be text with up to 1000 characters",
    });
  }

  // Startupot mora da izbere postoecki ili nov Job
  const hasExistingJob = Boolean(jobId);
  const hasNewJob = Boolean(newJob);

  if (hasExistingJob === hasNewJob) {
    return res.status(400).json({
      message: "Select an existing job or create a new job",
    });
  }

  // VALIDACIJA NA POSTOECKI JOB
  if (
    hasExistingJob &&
    !mongoose.Types.ObjectId.isValid(jobId)
  ) {
    return res.status(400).json({
      message: "Invalid job ID",
    });
  }

  // VALIDACIJA NA NOV JOB
  if (hasNewJob) {
    if (
      typeof newJob !== "object" ||
      Array.isArray(newJob) ||
      typeof newJob.title !== "string" ||
      !newJob.title.trim() ||
      typeof newJob.description !== "string" ||
      !newJob.description.trim() ||
      !Array.isArray(newJob.skillsRequired) ||
      newJob.skillsRequired.length === 0 ||
      !newJob.skillsRequired.every(
        (skill) =>
          typeof skill === "string" &&
          Boolean(skill.trim())
      )
    ) {
      return res.status(400).json({
        message:
          "Valid job title, description and at least one skill are required",
      });
    }
  }

  const session = await mongoose.startSession();

  try {
    let createdApplication = null;
    let selectedJob = null;

    await session.withTransaction(async () => {
      // PROVERKA DALI MENTOROT POSTOI
      const mentor = await User.findOne({
        _id: mentorId,
        role: "mentor",
      }).session(session);

      if (!mentor) {
        const error = new Error("Mentor not found");
        error.statusCode = 404;
        throw error;
      }

      // OPCIJA 1: POSTOECKI JOB
      if (hasExistingJob) {
        selectedJob = await Job.findOne({
          _id: jobId,
          companyId: req.user._id,
          status: "Open",
        }).session(session);

        if (!selectedJob) {
          const error = new Error(
            "Job not found, not yours, or no longer open"
          );

          error.statusCode = 404;
          throw error;
        }
      }

      // OPCIJA 2: KREIRANJE NOV JOB
      if (hasNewJob) {
        const createdJobs = await Job.create(
          [
            {
              companyId: req.user._id,
              title: newJob.title.trim(),
              description: newJob.description.trim(),
              skillsRequired: newJob.skillsRequired.map(
                (skill) => skill.trim()
              ),
              status: "Open",
            },
          ],
          { session }
        );

        selectedJob = createdJobs[0];
      }

      // PROVERKA DALI VEKE POSTOI AKTIVNA PONUDA
      // DO ISTIOT MENTOR ZA ISTIOT JOB
      const existingOffer = await Application.findOne({
        jobId: selectedJob._id,
        mentorId,
        applicationType: "companyToMentor",
        status: {
          $in: ["pending", "accepted"],
        },
      }).session(session);

      if (existingOffer) {
        const error = new Error(
          "An active offer already exists for this mentor and job"
        );

        error.statusCode = 409;
        throw error;
      }

      // KREIRANJE DIREKTNA PONUDA
      const createdApplications = await Application.create(
        [
          {
            companyId: req.user._id,
            mentorId,
            jobId: selectedJob._id,
            jobName: selectedJob.title,
            offerDescription: offerDescription.trim(),
            applicationType: "companyToMentor",
            status: "pending",
          },
        ],
        { session }
      );

      createdApplication = createdApplications[0];
    });

    return res.status(201).json({
      message: "Job offer sent successfully",
      application: createdApplication,
      job: selectedJob,
    });
  } catch (error) {
    console.error("Send job offer error:", error);

    if (
      error.code === 112 ||
      error.codeName === "WriteConflict"
    ) {
      return res.status(409).json({
        message:
          "This job was updated by another request. Please try again.",
      });
    }

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Server error while sending job offer",
    });
  } finally {
    await session.endSession();
  }
};

// PREZEMANJE NA APLIKACIITE ZA KONKRETEN JOB
// GET /api/applications/job/:jobId
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: jobId,
      companyId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const applications = await Application.find({
      jobId,
      applicationType: "mentorToCompany",
    })
      .populate("mentorId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Get job applications error:", error);

    return res.status(500).json({
      message: "Server error while fetching applications",
    });
  }
};

// PREZEMANJE NA APLIKACII I PONUDI NA NAJAVENIOT KORISNIK
// GET /api/applications/my
const getMyApplications = async (req, res) => {
  try {
    const filter =
      req.user.role === "mentor"
        ? { mentorId: req.user._id }
        : { companyId: req.user._id };

    const applications = await Application.find(filter)
      .populate(
        "jobId",
        "title description status skillsRequired"
      )
      .populate(
        "mentorId",
        "firstName lastName email"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Get my applications error:", error);

    return res.status(500).json({
      message: "Server error while fetching applications",
    });
  }
};

// PRIFAKJANJE ILI ODBIVANJE NA APLIKACIJA ILI PONUDA
// PATCH /api/applications/:id/respond
const respondToApplication = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid application ID",
    });
  }

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({
      message: "Status must be accepted or rejected",
    });
  }

  try {
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // MENTOR ODGOVARA SAMO NA DIREKTNI PONUDI DO NEGO
    if (application.applicationType === "companyToMentor") {
      if (
        req.user.role !== "mentor" ||
        application.mentorId.toString() !==
          req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to respond to this offer",
        });
      }
    }

    // STARTUP ODGOVARA SAMO NA APLIKACII DO NEGO
    if (application.applicationType === "mentorToCompany") {
      if (
        req.user.role !== "startup" ||
        application.companyId.toString() !==
          req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to respond to this application",
        });
      }
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        message:
          "This application has already been processed",
      });
    }

    // PRIFAKJANJE NA APLIKACIJA ILI DIREKTNA PONUDA
    // AKO E POVRZANA SO JOB
    if (status === "accepted" && application.jobId) {
      const session = await mongoose.startSession();

      try {
        let acceptedApplication = null;

        await session.withTransaction(async () => {
          // Povtorna proverka na aplikacijata
          const currentApplication =
            await Application.findOne({
              _id: id,
              status: "pending",
            }).session(session);

          if (!currentApplication) {
            const error = new Error(
              "This application has already been processed"
            );

            error.statusCode = 409;
            throw error;
          }

          // Go zatvorame Job samo ako e Open
          const job = await Job.findOneAndUpdate(
            {
              _id: currentApplication.jobId,
              companyId: currentApplication.companyId,
              status: "Open",
            },
            {
              $set: {
                status: "Closed",
              },
            },
            {
              new: true,
              session,
              runValidators: true,
            }
          );

          if (!job) {
            const error = new Error(
              "This job is already closed or unavailable"
            );

            error.statusCode = 409;
            throw error;
          }

          // Ja prifakjame izbranata aplikacija
          currentApplication.status = "accepted";
          currentApplication.acceptedAt = new Date();

          await currentApplication.save({ session });

          // Gi odbivame drugite pending aplikacii
          // i direktni ponudi za istiot Job
          await Application.updateMany(
            {
              jobId: job._id,
              _id: {
                $ne: currentApplication._id,
              },
              status: "pending",
            },
            {
              $set: {
                status: "rejected",
              },
            },
            { session }
          );

          acceptedApplication = currentApplication;
        });

        return res.status(200).json({
          message:
            "Application accepted and job closed successfully",
          application: acceptedApplication,
        });
      } catch (error) {
        if (
          error.statusCode === 409 ||
          error.code === 112 ||
          error.codeName === "WriteConflict"
        ) {
          return res.status(409).json({
            message:
              error.statusCode === 409
                ? error.message
                : "This job was updated by another request. Please refresh and try again.",
          });
        }

        throw error;
      } finally {
        await session.endSession();
      }
    }

    // STANDARDNA LOGIKA
    // Odbivanje ili odgovor na postara direktna ponuda
    // koja nema jobId
    const updateData = {
      status,
    };

    if (status === "accepted") {
      updateData.acceptedAt = new Date();
    }

    const updatedApplication =
      await Application.findOneAndUpdate(
        {
          _id: id,
          status: "pending",
        },
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedApplication) {
      return res.status(409).json({
        message:
          "This application has already been processed",
      });
    }

    return res.status(200).json({
      message: `Application ${status} successfully`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Respond to application error:", error);

    return res.status(500).json({
      message:
        "Server error while responding to application",
    });
  }
};

// STARTUP OTKAZUVA PRETHODNO ISPRATENA PONUDA
// PATCH /api/applications/:id/cancel
const cancelJobOffer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    const application = await Application.findOne({
      _id: id,
      companyId: req.user._id,
      applicationType: "companyToMentor",
    });

    if (!application) {
      return res.status(404).json({
        message: "Job offer not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message:
          "Only pending job offers can be cancelled",
      });
    }

    // Atomsko otkazuvanje na pending ponuda
    const cancelledApplication =
      await Application.findOneAndUpdate(
        {
          _id: id,
          companyId: req.user._id,
          applicationType: "companyToMentor",
          status: "pending",
        },
        {
          $set: {
            status: "cancelled",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!cancelledApplication) {
      return res.status(409).json({
        message:
          "This offer has already been processed",
      });
    }

    return res.status(200).json({
      message: "Job offer cancelled successfully",
      application: cancelledApplication,
    });
  } catch (error) {
    console.error("Cancel job offer error:", error);

    return res.status(500).json({
      message:
        "Server error while cancelling job offer",
    });
  }
};

// MENTOROT OZNAChUVA PRIFATEN ANGAZhMAN KAKO ZAVRShEN
// PATCH /api/applications/:id/complete
const completeJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    // Samo mentorot na koj mu e dodelen angazhmanot
    // moze da go oznaci kako zavrshen
    const application =
      await Application.findOneAndUpdate(
        {
          _id: id,
          mentorId: req.user._id,
          status: "accepted",
          acceptedStatus: "in progress",
        },
        {
          $set: {
            acceptedStatus: "done",
            completedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!application) {
      return res.status(404).json({
        message:
          "Active assigned job not found or already completed",
      });
    }

    return res.status(200).json({
      message:
        "Job marked as completed successfully",
      application,
    });
  } catch (error) {
    console.error("Complete job error:", error);

    return res.status(500).json({
      message:
        "Server error while completing job",
    });
  }
};

module.exports = {
  applyToJob,
  sendJobOffer,
  getJobApplications,
  getMyApplications,
  respondToApplication,
  cancelJobOffer,
  completeJob,
};
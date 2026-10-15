import { useEffect, useState } from "react";
import { X } from "lucide-react";

import api from "../../../api/axios";

import "./OfferJobModal.css";

function OfferJobModal({ mentor, onClose, onOfferSent }) {
  // Existing ili New Job
  const [jobMode, setJobMode] = useState("existing");

  // Postoecki Jobs od MongoDB
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  // Nov Job
  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");

  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Gi prezemame postoeckite Jobs na startupot
  useEffect(() => {
    let isActive = true;

    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        setJobsError("");

        const response = await api.get("/jobs/my-jobs");

        if (!isActive) return;

        const fetchedJobs = Array.isArray(response.data)
          ? response.data
          : [];

        // Samo otvoreni Jobs mozat da bidat ponudeni
        const openJobs = fetchedJobs.filter(
          (job) => job.status === "Open"
        );

        setJobs(openJobs);
      } catch (err) {
        if (!isActive) return;

        console.error("Failed to fetch jobs:", err);

        setJobsError(
          err.response?.data?.message ||
            "Failed to load your jobs."
        );
      } finally {
        if (isActive) {
          setJobsLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isActive = false;
    };
  }, []);

  // Izbraniot postoecki Job
  const selectedJob = jobs.find(
    (job) => job._id === selectedJobId
  );

  // Validacija na nov Job
  const parsedSkills = skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const isNewJobValid =
    jobName.trim().length > 0 &&
    description.trim().length > 0 &&
    parsedSkills.length > 0;

  // Validacija na celata forma
  const canSubmit =
    !loading &&
    (jobMode === "existing"
      ? Boolean(selectedJobId)
      : isNewJobValid);

  // Isprakjanje direktna ponuda
  const handleSendOffer = async (event) => {
    event.preventDefault();

    if (!canSubmit || !mentor?._id) return;

    try {
      setLoading(true);
      setError("");

      const payload = {
        mentorId: mentor._id,
      };

      if (jobMode === "existing") {
        // OPCIJA 1: POSTOECKI JOB
        payload.jobId = selectedJobId;
      } else {
        // OPCIJA 2: NOV JOB
        payload.newJob = {
          title: jobName.trim(),
          description: description.trim(),
          skillsRequired: parsedSkills,
        };
      }

      await api.post("/applications/offer", payload);

      // Osvezuvanje na ponudite
      onOfferSent?.();

      // Zatvoranje na modalot
      onClose();
    } catch (err) {
      console.error("Failed to send job offer:", err);

      setError(
        err.response?.data?.message ||
          "Failed to send job offer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="offer-job-overlay"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="offer-job-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-job-title"
        onClick={(event) => event.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          type="button"
          className="offer-job-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 id="offer-job-title">OFFER JOB</h2>

        <p className="offer-job-subtitle">
          Select an existing job or create a new one
        </p>

        <form onSubmit={handleSendOffer}>
          {/* JOB MODE */}
          <div className="offer-job-mode">
            <label className="offer-job-mode-option">
              <input
                type="radio"
                name="jobMode"
                value="existing"
                checked={jobMode === "existing"}
                onChange={() => {
                  setJobMode("existing");
                  setError("");
                }}
                disabled={loading}
              />

              <span>Select Existing Job</span>
            </label>

            <label className="offer-job-mode-option">
              <input
                type="radio"
                name="jobMode"
                value="new"
                checked={jobMode === "new"}
                onChange={() => {
                  setJobMode("new");
                  setError("");
                }}
                disabled={loading}
              />

              <span>Create New Job</span>
            </label>
          </div>

          {/* EXISTING JOB */}
          {jobMode === "existing" && (
            <>
              <div className="offer-job-field">
                <label htmlFor="offer-existing-job">
                  Select Job
                </label>

                <select
                  id="offer-existing-job"
                  value={selectedJobId}
                  onChange={(event) =>
                    setSelectedJobId(event.target.value)
                  }
                  disabled={loading || jobsLoading}
                  required
                >
                  <option value="">
                    {jobsLoading
                      ? "Loading jobs..."
                      : "Choose a job"}
                  </option>

                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              {jobsError && (
                <p className="offer-job-error">
                  {jobsError}
                </p>
              )}

              {!jobsLoading &&
                !jobsError &&
                jobs.length === 0 && (
                  <p className="offer-job-empty">
                    You don't have any open jobs yet.
                    Select "Create New Job" to continue.
                  </p>
                )}

              {/* DETAILS ZA IZBRANIOT JOB */}
              {selectedJob && (
                <div className="offer-job-preview">
                  <h3>{selectedJob.title}</h3>

                  <p>{selectedJob.description}</p>

                  {selectedJob.skillsRequired?.length > 0 && (
                    <div className="offer-job-preview-skills">
                      <strong>Required Skills:</strong>

                      <span>
                        {selectedJob.skillsRequired.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* CREATE NEW JOB */}
          {jobMode === "new" && (
            <>
              <div className="offer-job-field">
                <label htmlFor="offer-job-name">
                  Job Name
                </label>

                <input
                  type="text"
                  id="offer-job-name"
                  placeholder="Enter job name"
                  value={jobName}
                  onChange={(event) =>
                    setJobName(event.target.value)
                  }
                  maxLength={120}
                  required
                  disabled={loading}
                />
              </div>

              <div className="offer-job-field">
                <label htmlFor="offer-description">
                  Job Description
                </label>

                <textarea
                  id="offer-description"
                  placeholder="Describe the job"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={4}
                  required
                  disabled={loading}
                />
              </div>

              <div className="offer-job-field">
                <label htmlFor="offer-job-skills">
                  Required Skills
                </label>

                <input
                  type="text"
                  id="offer-job-skills"
                  placeholder="React, JavaScript, Node.js"
                  value={skills}
                  onChange={(event) =>
                    setSkills(event.target.value)
                  }
                  required
                  disabled={loading}
                />

                <small className="offer-job-hint">
                  Separate skills with commas.
                </small>
              </div>
            </>
          )}

          {/* ERROR */}
          {error && (
            <p className="offer-job-error" role="alert">
              {error}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="offer-job-submit"
            disabled={!canSubmit}
          >
            {loading ? "Sending..." : "Send Job Offer"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OfferJobModal;
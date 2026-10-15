import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";

import api from "../../api/axios";
import "./ViewJob.css";

function ViewJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // EDIT / DELETE STATES
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    skills: "",
  });

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const companyName = user?.startupName || "My Startup";

  // Prezemi gi detalite i aplikaciite od MongoDB
  useEffect(() => {
    let isActive = true;

    async function fetchJobDetails() {
      try {
        setLoading(true);
        setError("");

        const [jobResponse, applicationsResponse] =
          await Promise.all([
            api.get(`/jobs/${jobId}`),
            api.get(`/applications/job/${jobId}`),
          ]);

        if (!isActive) return;

        setJob(jobResponse.data);

        setApplications(
          Array.isArray(applicationsResponse.data)
            ? applicationsResponse.data
            : []
        );
      } catch (err) {
        if (!isActive) return;

        setError(
          err.response?.data?.message ||
            "Failed to load job details."
        );
      } finally {
        if (isActive) setLoading(false);
      }
    }

    fetchJobDetails();

    return () => {
      isActive = false;
    };
  }, [jobId]);

  // Osvezi gi podatocite po prifakjanje / odbivanje mentor
  async function refreshJobDetails() {
    const [jobResponse, applicationsResponse] =
      await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}`),
      ]);

    setJob(jobResponse.data);

    setApplications(
      Array.isArray(applicationsResponse.data)
        ? applicationsResponse.data
        : []
    );
  }

  // Startupot prifakja ili odbiva aplikacija
  async function handleRespond(applicationId, status) {
    if (processingId) return;

    try {
      setProcessingId(applicationId);
      setApplicationsError("");

      await api.patch(
        `/applications/${applicationId}/respond`,
        { status }
      );

      // Go osvezuvame i Job statusot i site aplikacii
      await refreshJobDetails();
    } catch (err) {
      console.error("Failed to respond to application:", err);

      setApplicationsError(
        err.response?.data?.message ||
          "Failed to update application status."
      );
    } finally {
      setProcessingId(null);
    }
  }

  // Otvoranje na Edit modal so postoeckite podatoci
  function handleOpenEdit() {
    if (!job) return;

    setActionError("");

    setEditForm({
      title: job.title || "",
      description: job.description || "",
      skills: (job.skillsRequired || []).join(", "),
    });

    setEditOpen(true);
  }

  // Zacuvuvanje na promenite
  async function handleUpdateJob(event) {
    event.preventDefault();

    if (saving) return;

    const title = editForm.title.trim();
    const description = editForm.description.trim();

    const skillsRequired = editForm.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!title || !description || skillsRequired.length === 0) {
      setActionError(
        "Please fill in all fields and add at least one skill."
      );
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      const response = await api.patch(`/jobs/${jobId}`, {
        title,
        description,
        skillsRequired,
      });

      // Vednas gi prikazuvame novite podatoci
      setJob(response.data.job);
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update job:", err);

      setActionError(
        err.response?.data?.message ||
          "Failed to update job."
      );
    } finally {
      setSaving(false);
    }
  }

  // Brisenje na Job
  async function handleDeleteJob() {
    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this job? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setActionError("");

      await api.delete(`/jobs/${jobId}`);

      // Vrakjanje na Jobs listata
      navigate("/startup/jobs");
    } catch (err) {
      console.error("Failed to delete job:", err);

      setActionError(
        err.response?.data?.message ||
          "Failed to delete job."
      );
    } finally {
      setDeleting(false);
    }
  }

  const formattedDate = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  // Samo aplikacii za ovoj javen Job
  const jobApplications = applications.filter(
    (application) =>
      application.applicationType === "mentorToCompany"
  );

  const totalApplicants = jobApplications.length;

  // Edit/Delete se dozvoleni samo za Open Job bez aplikacii
  const canManageJob =
    job?.status === "Open" && totalApplicants === 0;

  return (
    <div className="view-job-page">
      <div className="view-job-header">
        <div>
          <h1>Job Details</h1>
          <p>View information about your startup job.</p>
        </div>

        <button
          type="button"
          className="view-job-back"
          onClick={() => navigate("/startup/jobs")}
        >
          Back to Jobs
        </button>
      </div>

      {loading && (
        <div className="view-job-message">
          Loading job details...
        </div>
      )}

      {!loading && error && (
        <div className="view-job-message view-job-error">
          {error}
        </div>
      )}

      {!loading && !error && job && (
        <>
          {/* JOB DETAILS */}
          <div className="view-job-card">
            {/* COMPANY */}
            <div className="view-job-company">
              <div className="view-job-company-avatar">
                {companyName.charAt(0).toUpperCase()}
              </div>

              <div>
                <span className="view-job-company-label">
                  Startup Company
                </span>

                <h3>{companyName}</h3>
              </div>
            </div>

            {/* TITLE */}
            <div className="view-job-title-section">
              <h2>{job.title}</h2>

              <span className="view-job-status">
                {job.status}
              </span>
            </div>

            {/* DESCRIPTION */}
            <div className="view-job-section">
              <h3>Job Description</h3>
              <p>{job.description}</p>
            </div>

            {/* SKILLS */}
            <div className="view-job-section">
              <h3>Required Skills</h3>

              <div className="view-job-skills">
                {job.skillsRequired?.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="view-job-skill"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* ADDITIONAL INFORMATION */}
            <div className="view-job-info">
              <div className="view-job-info-item">
                <span>Job Type</span>
                <strong>{job.status}</strong>
              </div>

              <div className="view-job-info-item">
                <span>Created At</span>
                <strong>{formattedDate}</strong>
              </div>

              <div className="view-job-info-item">
                <span>Applicants</span>
                <strong>{totalApplicants}</strong>
              </div>
            </div>

            {/* EDIT / DELETE */}
            {canManageJob && (
              <div className="view-job-manage-actions">
                <button
                  type="button"
                  className="view-job-edit-button"
                  onClick={handleOpenEdit}
                >
                  Edit Job
                </button>

                <button
                  type="button"
                  className="view-job-delete-button"
                  onClick={handleDeleteJob}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Job"}
                </button>
              </div>
            )}

            {actionError && !editOpen && (
              <p className="view-job-action-error" role="alert">
                {actionError}
              </p>
            )}
          </div>

          {/* APPLICANTS */}
          <section className="view-job-applicants">
            <div className="view-job-applicants-header">
              <h2>Applicants ({totalApplicants})</h2>
              <p>
                Review mentors who applied for this job.
              </p>
            </div>

            {applicationsError && (
              <p className="view-job-applicants-error">
                {applicationsError}
              </p>
            )}

            {jobApplications.length === 0 ? (
              <div className="view-job-applicants-empty">
                No applications received yet.
              </div>
            ) : (
              <div className="view-job-applicants-list">
                {jobApplications.map((application) => {
                  const mentor = application.mentorId;

                  const mentorName = mentor
                    ? `${mentor.firstName || ""} ${
                        mentor.lastName || ""
                      }`.trim()
                    : "Unknown Mentor";

                  const isPending =
                    application.status === "pending";

                  const isProcessing =
                    processingId === application._id;

                  return (
                    <div
                      key={application._id}
                      className="view-job-applicant-card"
                    >
                      <div className="view-job-applicant-info">
                        <div className="view-job-applicant-avatar">
                          {mentorName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <h3>{mentorName}</h3>
                          <p>{mentor?.email || ""}</p>
                        </div>
                      </div>

                      <div className="view-job-applicant-actions">
                        <span
                          className={`view-job-applicant-status status-${application.status}`}
                        >
                          {application.status}
                        </span>

                        {isPending && job.status === "Open" && (
                          <>
                            <button
                              type="button"
                              className="view-job-applicant-accept"
                              disabled={Boolean(processingId)}
                              onClick={() =>
                                handleRespond(
                                  application._id,
                                  "accepted"
                                )
                              }
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Accept"}
                            </button>

                            <button
                              type="button"
                              className="view-job-applicant-reject"
                              disabled={Boolean(processingId)}
                              onClick={() =>
                                handleRespond(
                                  application._id,
                                  "rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* EDIT JOB MODAL */}
      {editOpen && (
        <div
          className="view-job-modal-overlay"
          onClick={() => {
            if (!saving) setEditOpen(false);
          }}
        >
          <div
            className="view-job-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-job-edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="view-job-modal-close"
              onClick={() => setEditOpen(false)}
              disabled={saving}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 id="view-job-edit-title">Edit Job</h2>

            <form onSubmit={handleUpdateJob}>
              <label htmlFor="edit-job-title">
                Job Title
              </label>

              <input
                id="edit-job-title"
                type="text"
                value={editForm.title}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    title: event.target.value,
                  })
                }
                required
              />

              <label htmlFor="edit-job-description">
                Job Description
              </label>

              <textarea
                id="edit-job-description"
                value={editForm.description}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    description: event.target.value,
                  })
                }
                rows={5}
                required
              />

              <label htmlFor="edit-job-skills">
                Required Skills (comma separated)
              </label>

              <input
                id="edit-job-skills"
                type="text"
                value={editForm.skills}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    skills: event.target.value,
                  })
                }
                placeholder="React, JavaScript, Node.js"
                required
              />

              {actionError && (
                <p className="view-job-action-error" role="alert">
                  {actionError}
                </p>
              )}

              <div className="view-job-modal-actions">
                <button
                  type="button"
                  className="view-job-modal-cancel"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="view-job-modal-save"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewJob;
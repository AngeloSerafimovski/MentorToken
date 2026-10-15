import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const companyName = user?.startupName || "My Startup";

  // Prezemi gi detalite za rabotata i aplikaciite od MongoDB
  useEffect(() => {
    let isActive = true;

    async function fetchJobDetails() {
      try {
        setLoading(true);
        setError("");
        setApplicationsError("");

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

        console.error("Failed to fetch job details:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load job details."
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchJobDetails();

    return () => {
      isActive = false;
    };
  }, [jobId]);

  // Startupot prifakja ili odbiva aplikacija od mentor
  async function handleRespond(applicationId, status) {
    if (processingId) return;

    try {
      setProcessingId(applicationId);
      setApplicationsError("");

      await api.patch(
        `/applications/${applicationId}/respond`,
        { status }
      );

      // Go azhurirame statusot bez refresh na stranicata
      setApplications((previous) =>
        previous.map((application) =>
          application._id === applicationId
            ? { ...application, status }
            : application
        )
      );
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

  const formattedDate = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  // Gi broime samo aplikaciite za ovoj javen Job
  const jobApplications = applications.filter(
    (application) =>
      application.applicationType === "mentorToCompany"
  );

  const totalApplicants = jobApplications.length;

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
          {/* POSTOECHKA JOB DETAILS KARTICHKA */}
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
          </div>

          {/* NOVA APPLICANTS SEKCIJA */}
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

                        {isPending && (
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
    </div>
  );
}

export default ViewJob;
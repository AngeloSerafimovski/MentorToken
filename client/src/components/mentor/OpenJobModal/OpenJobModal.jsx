import { useState } from "react";
import { X } from "lucide-react";

import api from "../../../api/axios";

import "./OpenJobModal.css";

function OpenJobModal({ job, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const companyName = job.companyId?.startupName || "Startup";

  // Isprakjanje aplikacija za izbraniot Job
  async function handleApply() {
    if (loading || success) return;

    try {
      setLoading(true);
      setError("");

      await api.post(`/applications/apply/${job._id}`);

      setSuccess(true);
    } catch (err) {
      console.error("Error applying to job:", err);

      setError(
        err.response?.data?.message ||
          "Failed to apply for this job."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mentor-open-job-overlay" onClick={onClose}>
      <div
        className="mentor-open-job-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-open-job-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="mentor-open-job-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="mentor-open-job-company">
          <div className="mentor-open-job-logo">
            {companyName.charAt(0).toUpperCase()}
          </div>

          <span>{companyName}</span>
        </div>

        <h2 id="mentor-open-job-title">{job.title}</h2>

        <p className="mentor-open-job-description">
          {job.description}
        </p>

        {Array.isArray(job.skillsRequired) &&
          job.skillsRequired.length > 0 && (
            <p className="mentor-open-job-skills">
              <strong>Required skills:</strong>{" "}
              {job.skillsRequired.join(", ")}
            </p>
          )}

        {error && (
          <p className="mentor-open-job-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="mentor-open-job-success">
            Application sent successfully!
          </p>
        )}

        <button
          type="button"
          className="mentor-open-job-apply"
          disabled={loading || success}
          onClick={handleApply}
        >
          {loading
            ? "Applying..."
            : success
            ? "Applied"
            : "Apply"}
        </button>
      </div>
    </div>
  );
}

export default OpenJobModal;
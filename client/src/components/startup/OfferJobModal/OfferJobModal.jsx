import { useState } from "react";
import { X } from "lucide-react";
import api from "../../../api/axios";

import "./OfferJobModal.css";

function OfferJobModal({ mentor, onClose, onOfferSent }) {
  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOffer = async (e) => {
    e.preventDefault();

    if (!jobName.trim() || loading) return;

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // Isprakjanje direktna ponuda do mentorot
      await api.post(
        "/applications/offer",
        {
          mentorId: mentor._id,
          jobName: jobName.trim(),
          offerDescription: description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Osvezhuvanje na ponudite po uspeshno isprakjanje
      onOfferSent?.();
      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send job offer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="offer-job-overlay" onClick={onClose}>
      <div
        className="offer-job-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-job-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="offer-job-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 id="offer-job-title">OFFER JOB</h2>

        <p className="offer-job-subtitle">
          Create and offer job to a mentor
        </p>

        <form onSubmit={handleSendOffer}>
          <div className="offer-job-field">
            <label htmlFor="offer-job-name">
              Job Name
            </label>

            <input
              type="text"
              id="offer-job-name"
              placeholder="Enter job name"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="offer-job-field">
            <label htmlFor="offer-description">
              Short Description
            </label>

            <textarea
              id="offer-description"
              placeholder="Write short description about job offering"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={5}
            />
          </div>

          {error && (
            <p className="offer-job-error">{error}</p>
          )}

          <button
            type="submit"
            className="offer-job-submit"
            disabled={!jobName.trim() || loading}
          >
            {loading ? "Sending..." : "Send Job Offer"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OfferJobModal;
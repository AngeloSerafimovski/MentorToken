import { useState } from "react";
import { X } from "lucide-react";

import "./AddMentorModal.css";

function AddMentorModal({
  onClose,
  onAddMentor,
  addedMentorIds = [],
  availableMentors = [],
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pronagjanje registriran mentor spored vnesenata email adresa
  const mentor = availableMentors.find(
    (user) =>
      user.role === "mentor" &&
      user.email?.toLowerCase() === email.trim().toLowerCase()
  );

  // Prezemanje na imeto i prezimeto od pronajdeniot mentor
  const firstName = mentor?.firstName || "";
  const surname = mentor?.lastName || "";

  // Proverka dali mentorot vekje e dodaden vo listata
  const alreadyAdded = mentor
    ? addedMentorIds.includes(mentor._id)
    : false;

  // Dodavanje na mentorot vo My Mentors preku backendot
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isSubmitting) {
      return;
    }

    if (!mentor) {
      setError("No registered mentor found with this email address.");
      return;
    }

    if (alreadyAdded) {
      setError("This mentor is already in your list.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Chekame backendot da potvrdi deka mentorot e dodaden
      await onAddMentor(mentor);

      // Modalot se zatvora samo ako dodavanjeto e uspeshno
      onClose();
    } catch (err) {
      console.error("Error adding mentor:", err);

      setError(
        err.message || "Failed to add mentor. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="add-mentor-overlay"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="add-mentor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-mentor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="add-mentor-close"
          onClick={onClose}
          aria-label="Close modal"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        <h2 id="add-mentor-title">ADD NEW MENTOR</h2>

        <p className="add-mentor-subtitle">
          Find and add an existing mentor
        </p>

        <form onSubmit={handleSubmit}>
          <div className="add-mentor-field">
            <label htmlFor="mentor-email">
              Email Address
            </label>

            <input
              id="mentor-email"
              type="email"
              placeholder="newmentor@mail.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="add-mentor-name-fields">
            <div className="add-mentor-field">
              <label htmlFor="mentor-firstname">
                Name
              </label>

              <input
                id="mentor-firstname"
                type="text"
                value={firstName}
                placeholder="Name"
                readOnly
              />
            </div>

            <div className="add-mentor-field">
              <label htmlFor="mentor-surname">
                Surname
              </label>

              <input
                id="mentor-surname"
                type="text"
                value={surname}
                placeholder="Surname"
                readOnly
              />
            </div>
          </div>

          {error && (
            <p className="add-mentor-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="add-mentor-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Mentor"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMentorModal;
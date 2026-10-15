import "./MentorAbout.css";

function MentorAbout({ mentor, onOfferJob }) {
  return (
    <section className="mentor-about">
      <div className="mentor-about-header">
        <h2>About Mentor</h2>

        <button
          type="button"
          className="mentor-about-offer-button"
          onClick={() => onOfferJob?.(mentor)}
        >
          + Offer New Job
        </button>
      </div>

      <p className="mentor-about-skills">
        <strong>Skills:</strong>{" "}
        {mentor.skills?.join(" | ") || "Not specified"}
      </p>

      <p className="mentor-about-description">
        {mentor.desc || "No description available."}
      </p>
    </section>
  );
}

export default MentorAbout;
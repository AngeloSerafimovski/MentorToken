import { Star } from "lucide-react";
import "./MentorCard.css";

function MentorCard({ mentor, onViewMentor }) {
  const initials = mentor.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <article className="mentor-card">
      <div className="mentor-card-avatar">
        {initials}
      </div>

      <div className="mentor-card-content">
        <h3 className="mentor-card-name">{mentor.name}</h3>

        <div className="mentor-card-rating">
          <div className="mentor-card-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                fill={star <= Math.round(mentor.rating) ? "#696cff" : "none"}
                color="#696cff"
                strokeWidth={1.5}
              />
            ))}
          </div>

          <span>{mentor.rating} average rating</span>
        </div>

        <p className="mentor-card-skills">
          <strong>Skills:</strong> {mentor.skills?.join(" | ")}
        </p>

        <p className="mentor-card-description">
          {mentor.desc || "No description available."}
        </p>
      </div>

      <button
        type="button"
        className="mentor-card-button"
        onClick={() => onViewMentor?.(mentor)}
      >
        View Mentor
      </button>
    </article>
  );
}

export default MentorCard;
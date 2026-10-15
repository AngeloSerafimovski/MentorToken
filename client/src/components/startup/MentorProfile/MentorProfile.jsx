import { Mail, Phone, CheckCircle2 } from "lucide-react";
import "./MentorProfile.css";

function MentorProfile({ mentor }) {
  const initials = mentor.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <section className="mentor-profile">
      <div className="mentor-profile-avatar-wrapper">
        {mentor.avatar ? (
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="mentor-profile-avatar"
          />
        ) : (
          <div className="mentor-profile-avatar">
            {initials}
          </div>
        )}

        {mentor.isActive === true && (
          <CheckCircle2
            className="mentor-profile-status"
            size={20}
            fill="#35c779"
            color="#ffffff"
          />
        )}
      </div>

      <h2 className="mentor-profile-name">
        {mentor.name}
      </h2>

      {mentor.position && (
        <p className="mentor-profile-position">
          {mentor.position}
        </p>
      )}

      <div className="mentor-profile-contact">
        {mentor.email && (
          <div className="mentor-profile-contact-item">
            <Mail size={15} />
            <span>{mentor.email}</span>
          </div>
        )}

        {mentor.phone && (
          <div className="mentor-profile-contact-item">
            <Phone size={15} />
            <span>{mentor.phone}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default MentorProfile;
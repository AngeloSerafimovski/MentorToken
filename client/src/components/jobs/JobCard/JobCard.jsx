import { useNavigate } from "react-router-dom";
import "./JobCard.css";

function JobCard({
  job,
  companyName,
  applicantsCount = 0,
  assignedMentor = "",
  variant = "startup",
}) {
  const navigate = useNavigate();

  const handleViewMore = () => {
    if (variant === "startup") {
      navigate(`/startup/jobs/${job._id}`);
    } else {
      navigate(`/mentor/jobs/${job._id}`);
    }
  };

  // Ime na startupot
  const displayCompanyName =
    job.companyId?.startupName || companyName || "Startup";

  // Inicijali ako startupot nema profilna slika
  const companyInitials = displayCompanyName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Profilna slika od MongoDB
  const profilePicture = job.companyId?.profilePicture;

  // Backend adresa
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");

  // Celosna pateka do profilnata slika
  const profilePictureUrl = profilePicture
    ? profilePicture.startsWith("http")
      ? profilePicture
      : `${backendUrl}${profilePicture}`
    : null;

  return (
    <article className="job-card">

      {/* STARTUP INFORMATION */}
      <div className="job-card-company">

        <div className="job-card-company-avatar">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={`${displayCompanyName} logo`}
              className="job-card-company-avatar-image"
            />
          ) : (
            companyInitials
          )}
        </div>

        <span className="job-card-company-name">
          {displayCompanyName}
        </span>

      </div>

      {/* JOB TITLE */}
      <h3 className="job-card-title">
        {job.title}
      </h3>

      {/* JOB DESCRIPTION */}
      <p className="job-card-description">
        {job.description}
      </p>

      {/* PRIFATEN MENTOR */}
      {variant === "startup" && assignedMentor && (
        <div className="job-card-assigned-mentor">

          <span className="job-card-assigned-label">
            Assigned Mentor:
          </span>

          <span className="job-card-assigned-name">
            {assignedMentor}
          </span>

        </div>
      )}

      {/* JOB FOOTER */}
      <div className="job-card-footer">

        {variant === "startup" ? (
          <div className="job-card-applicants">

            <span className="job-card-applicants-number">
              {applicantsCount}
            </span>

            <span>
              {applicantsCount === 1
                ? "Applicant"
                : "Applicants"}
            </span>

          </div>
        ) : (
          <span className="job-card-category">
            {job.skillsRequired?.[0] || "General"}
          </span>
        )}

        <button
          type="button"
          className="job-card-view-button"
          onClick={handleViewMore}
        >
          View More
        </button>

      </div>

    </article>
  );
}

export default JobCard;
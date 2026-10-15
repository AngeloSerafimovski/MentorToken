import { useEffect, useState } from "react";
import { SlidersHorizontal, LayoutGrid } from "lucide-react";

import api from "../../api/axios";
import OpenJobModal from "../../components/mentor/OpenJobModal/OpenJobModal";

import "./MentorJobFeed.css";

// Backend adresa za profilnite sliki
const apiBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");
function MentorJobFeed() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gi prezemame site otvoreni raboti od MongoDB
  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await api.get("/jobs/feed");

        setJobs(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching job feed:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load available jobs."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // Gi sobirame site razlichni veshtini od objavenite raboti
  const availableSkills = [
    ...new Set(
      jobs.flatMap((job) =>
        Array.isArray(job.skillsRequired) ? job.skillsRequired : []
      )
    ),
  ].sort();

  // Filtriranje spored potrebnata veshtina
  const filteredJobs = jobs.filter((job) => {
    if (selectedSkill === "all") return true;

    return job.skillsRequired?.includes(selectedSkill);
  });

  // Sortiranje na rabotite
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sortBy === "name") {
      return a.title.localeCompare(b.title);
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="mentor-job-feed">
      <h1 className="mentor-job-feed-title">All startup Jobs</h1>

      <div className="mentor-job-feed-toolbar">
        <div className="mentor-job-feed-selects">
          <label className="mentor-job-feed-select">
            <span>Sort by:</span>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
          </label>

          <label className="mentor-job-feed-select">
            <span>Category:</span>

            <select
              value={selectedSkill}
              onChange={(event) => setSelectedSkill(event.target.value)}
            >
              <option value="all">All Categories</option>

              {availableSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mentor-job-feed-actions">
          <button
            type="button"
            className={`mentor-job-feed-filter-button ${
              showFilters ? "active" : ""
            }`}
            onClick={() => setShowFilters((previous) => !previous)}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          <button
            type="button"
            className="mentor-job-feed-grid-button"
            aria-label="Grid view"
            title="Grid view"
          >
            <LayoutGrid size={17} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mentor-job-feed-filter-info">
          Use the category dropdown to filter jobs by required skills.
        </div>
      )}

      {error && (
        <p className="mentor-job-feed-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mentor-job-feed-message">Loading jobs...</p>
      ) : sortedJobs.length === 0 ? (
        <p className="mentor-job-feed-message">
          No available jobs found.
        </p>
      ) : (
        <div className="mentor-job-feed-grid">
          {sortedJobs.map((job) => {
  // Ime na startupot
  const companyName =
    job.companyId?.startupName || "Startup";

  // Profilna slika na startupot
  const profilePicture = job.companyId?.profilePicture;

  // Celosna adresa do slikata
  const profilePictureUrl = profilePicture
    ? profilePicture.startsWith("http")
      ? profilePicture
      : `${backendUrl}${profilePicture}`
    : null;

  return (
    <article key={job._id} className="mentor-job-card">
      <div className="mentor-job-card-company">
        <div className="mentor-job-card-logo">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={`${companyName} logo`}
              className="mentor-job-card-logo-image"
            />
          ) : (
            companyName.charAt(0).toUpperCase()
          )}
        </div>

        <span>{companyName}</span>
      </div>

                <h2 className="mentor-job-card-title">
                  {job.title}
                </h2>

                <p className="mentor-job-card-description">
                  {job.description}
                </p>

                <button
                  type="button"
                  className="mentor-job-card-button"
                  onClick={() => setSelectedJob(job)}
                >
                  View More
                </button>
              </article>
            );
          })}
        </div>
      )}

      {selectedJob && (
        <OpenJobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

export default MentorJobFeed;
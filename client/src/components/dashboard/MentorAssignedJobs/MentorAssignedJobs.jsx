import { useEffect, useState } from "react";
import api from "../../../api/axios";

import "./MentorAssignedJobs.css";

const filters = [
  { label: "All", value: "all" },
  { label: "Done", value: "done" },
  { label: "Canceled", value: "rejected" },
  { label: "In Progress", value: "in progress" },
];

function MentorAssignedJobs({ mentorId, refreshKey = 0 }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchAssignedJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        // Prezemanje na aplikaciite i ponudite od MongoDB
        const response = await api.get("/applications/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Proverka dali odgovorot e lista
        const applications = Array.isArray(response.data)
          ? response.data
          : [];

        // Filtriranje na prifatenite aplikacii za konkretniot mentor
        const mentorApplications = applications.filter(
          (application) => {
            const applicationMentorId =
              typeof application.mentorId === "object"
                ? application.mentorId?._id
                : application.mentorId;

            return (
              applicationMentorId === mentorId &&
              application.status === "accepted"
            );
          }
        );

        // Podgotovka na podatocite za prikazhuvanje
        const jobs = mentorApplications.map((application) => ({
          applicationId: application._id,

          // Direktnite ponudi imaat jobName, a javnite jobs imaat title
          title:
            application.jobName ||
            application.jobId?.title ||
            "Unknown Job",

          acceptedStatus:
            application.acceptedStatus || "in progress",
        }));

        if (isMounted) {
          setAssignedJobs(jobs);
        }
      } catch (error) {
        console.error(
          "Greshka pri prezemanje na angazhmanite:",
          error
        );

        if (isMounted) {
          setError(
            error.response?.data?.message ||
              "Failed to load assigned jobs."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAssignedJobs();

    return () => {
      isMounted = false;
    };
  }, [mentorId, refreshKey]);

  // Filtriranje na angazhmanite spored izbraniot status
  const filteredJobs =
    activeFilter === "all"
      ? assignedJobs
      : assignedJobs.filter(
          (job) => job.acceptedStatus === activeFilter
        );

  // Pretvoranje na statusot vo tekst za prikazhuvanje
  function getStatusLabel(status) {
    switch (status) {
      case "done":
        return "DONE";

      case "rejected":
        return "CANCELED";

      case "in progress":
        return "IN PROGRESS";

      default:
        return status?.toUpperCase() || "UNKNOWN";
    }
  }

  // Odreduvanje na CSS klasata spored statusot
  function getStatusClass(status) {
    switch (status) {
      case "done":
        return "done";

      case "rejected":
        return "canceled";

      case "in progress":
        return "in-progress";

      default:
        return "";
    }
  }

  return (
    <div className="mentor-assigned-jobs">
      <h2>Assigned Jobs</h2>

      {/* Filtri za prikazhuvanje na angazhmanite */}
      <div className="mentor-jobs-filters">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`mentor-jobs-filter ${
              activeFilter === filter.value ? "active" : ""
            }`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Lista na angazhmani */}
      <div className="mentor-jobs-list">
        {loading ? (
          <p className="mentor-jobs-empty">
            Loading assigned jobs...
          </p>
        ) : error ? (
          <p className="mentor-jobs-empty">
            {error}
          </p>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              className="mentor-job-row"
              key={job.applicationId}
            >
              <span className="mentor-job-title">
                {job.title}
              </span>

              <span
                className={`mentor-job-status ${getStatusClass(
                  job.acceptedStatus
                )}`}
              >
                {getStatusLabel(job.acceptedStatus)}
              </span>
            </div>
          ))
        ) : (
          <p className="mentor-jobs-empty">
            No jobs found for this filter.
          </p>
        )}
      </div>
    </div>
  );
}

export default MentorAssignedJobs;
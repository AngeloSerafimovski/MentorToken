import { useState } from "react";

import "./AssignedJobs.css";

const filters = [
  { label: "All", value: "all" },
  { label: "Done", value: "done" },
  { label: "Rejected", value: "rejected" },
  { label: "In Progress", value: "in progress" },
];

function AssignedJobs({ applications = [] }) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Gi zemame samo prifatenite angazhmani
  const assignedJobs = applications
    .filter((application) => application.status === "accepted")
    .map((application) => ({
      ...application,

      // Za javni Jobs koristime title, za direktni ponudi jobName
      jobTitle:
        application.jobId?.title ||
        application.jobName ||
        "Unknown Job",

      acceptedStatus: application.acceptedStatus || "in progress",
    }));

  // Filtriranje spored statusot na angazhmanot
  const filteredJobs = assignedJobs.filter((job) => {
    if (activeFilter === "all") return true;

    return job.acceptedStatus === activeFilter;
  });

  return (
    <section className="assigned-jobs">
      <h2 className="assigned-jobs-title">
        Assigned Jobs
      </h2>

      <div className="assigned-jobs-filters">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`assigned-filter ${
              activeFilter === filter.value ? "active" : ""
            }`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="assigned-jobs-list">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              className="assigned-job-card"
              key={job._id}
            >
              <span className="assigned-job-name">
                {job.jobTitle}
              </span>

              <span
                className={`assigned-job-status ${
                  job.acceptedStatus.replace(/\s+/g, "-")
                }`}
              >
                {job.acceptedStatus.toUpperCase()}
              </span>
            </div>
          ))
        ) : (
          <p className="assigned-jobs-empty">
            No jobs found for this status.
          </p>
        )}
      </div>
    </section>
  );
}

export default AssignedJobs;
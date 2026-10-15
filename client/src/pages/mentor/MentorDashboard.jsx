import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

import api from "../../api/axios";

import "./MentorDashboard.css";

function MentorDashboard() {
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);

  // Gi prezemame aplikaciite i ponudite na najaveniot mentor
  const fetchApplications = async () => {
    try {
      setError("");

      const response = await api.get("/applications/my");

      setApplications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Error fetching applications:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Go odreduvame imeto na rabotnata pozicija
  const getJobName = (application) => {
    return (
      application.jobName ||
      application.jobId?.title ||
      "Unknown Job"
    );
  };

  // Mentorot prifakja ili odbiva direktna ponuda
  const handleRespond = async (applicationId, status) => {
    if (respondingId !== null) return;

    try {
      setRespondingId(applicationId);
      setError("");

      await api.patch(
        `/applications/${applicationId}/respond`,
        { status }
      );

      // Gi osvezhuvame podatocite po promenata
      await fetchApplications();
    } catch (err) {
      console.error("Error responding to job offer:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update job offer."
      );
    } finally {
      setRespondingId(null);
    }
  };

  // Mentorot oznachuva prifaten angazhman kako zavrshen
  const handleCompleteJob = async (applicationId) => {
    if (respondingId !== null) return;

    const confirmed = window.confirm(
      "Are you sure you want to mark this job as completed?"
    );

    if (!confirmed) return;

    try {
      setRespondingId(applicationId);
      setError("");

      // Isprakjame PATCH request do backendot
      await api.patch(
        `/applications/${applicationId}/complete`
      );

      // Gi osvezhuvame angazhmanite od MongoDB
      await fetchApplications();
    } catch (err) {
      console.error("Error completing job:", err);

      setError(
        err.response?.data?.message ||
          "Failed to complete job."
      );
    } finally {
      setRespondingId(null);
    }
  };

  // Site prifateni angazhmani na mentorot
  const assignedJobs = applications.filter(
    (application) => application.status === "accepted"
  );

  // Direktni ponudi isprateni od startup do mentor
  const pendingJobs = applications.filter(
    (application) =>
      application.applicationType === "companyToMentor" &&
      application.status === "pending"
  );

  // Aplikacii shto mentorot gi ispratil za javni Jobs
  const applicationsSent = applications.filter(
    (application) =>
      application.applicationType === "mentorToCompany"
  );

  // Filteri za Assigned Jobs
  const filters = [
    "All",
    "Done",
    "Rejected",
    "In Progress",
  ];

  // Filtriranje spored statusot na angazhmanot
  const filteredAssignedJobs = assignedJobs.filter(
    (application) => {
      if (activeFilter === "All") {
        return true;
      }

      const status =
        application.acceptedStatus || "in progress";

      if (activeFilter === "Done") {
        return status === "done";
      }

      if (activeFilter === "Rejected") {
        return status === "rejected";
      }

      if (activeFilter === "In Progress") {
        return status === "in progress";
      }

      return true;
    }
  );

  // CSS klasa za statusot na angazhmanot
  const getStatusClass = (status) => {
    switch (status) {
      case "done":
        return "mentor-job-status-done";

      case "rejected":
        return "mentor-job-status-rejected";

      default:
        return "mentor-job-status-progress";
    }
  };

  // Tekst za statusot na angazhmanot
  const getStatusLabel = (status) => {
    switch (status) {
      case "done":
        return "DONE";

      case "rejected":
        return "REJECTED";

      default:
        return "IN PROGRESS";
    }
  };

  return (
    <div className="mentor-dashboard">

      {/* Poraka pri greshka */}
      {error && (
        <div className="mentor-dashboard-error" role="alert">
          {error}
        </div>
      )}

      {/* Glaven raspored na dashboardot */}
      <div className="mentor-dashboard-grid">

        {/* LEVA KOLONA - ASSIGNED JOBS */}
        <section className="mentor-dashboard-section">
          <h2 className="mentor-dashboard-title">
            Assigned Jobs
          </h2>

          <div className="mentor-assigned-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter === filter
                    ? "mentor-assigned-filter active"
                    : "mentor-assigned-filter"
                }
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mentor-dashboard-list">
            {loading ? (
              <p className="mentor-dashboard-empty">
                Loading jobs...
              </p>
            ) : filteredAssignedJobs.length > 0 ? (
              filteredAssignedJobs.map((application) => {
                const status =
                  application.acceptedStatus || "in progress";

                return (
                  <div
                    key={application._id}
                    className="mentor-assigned-job-row"
                  >
                    <span className="mentor-job-name">
                      {getJobName(application)}
                    </span>

                    <div className="mentor-assigned-job-actions">
                      <span
                        className={`mentor-job-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>

                      {/* Mark as Done samo za aktivni angazhmani */}
                      {status === "in progress" && (
                        <button
                          type="button"
                          className="mentor-mark-done-button"
                          disabled={respondingId !== null}
                          onClick={() =>
                            handleCompleteJob(application._id)
                          }
                        >
                          {respondingId === application._id
                            ? "Saving..."
                            : "Mark as Done"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="mentor-dashboard-empty">
                No assigned jobs found.
              </p>
            )}
          </div>
        </section>

        {/* DESNA KOLONA */}
        <div className="mentor-dashboard-right">

          {/* PENDING JOBS */}
          <section className="mentor-dashboard-section">
            <h2 className="mentor-dashboard-title">
              Pending Jobs
            </h2>

            <p className="mentor-dashboard-subtitle">
              Jobs offered from your startup
            </p>

            <div className="mentor-dashboard-list">
              {loading ? (
                <p className="mentor-dashboard-empty">
                  Loading offers...
                </p>
              ) : pendingJobs.length > 0 ? (
                pendingJobs.map((application) => (
                  <div
                    key={application._id}
                    className="mentor-pending-job-row"
                  >
                    <span className="mentor-job-name">
                      {getJobName(application)}
                    </span>

                    <div className="mentor-pending-actions">
                      <button
                        type="button"
                        className="mentor-accept-button"
                        disabled={respondingId !== null}
                        onClick={() =>
                          handleRespond(
                            application._id,
                            "accepted"
                          )
                        }
                      >
                        {respondingId === application._id
                          ? "..."
                          : "Accept"}
                      </button>

                      <button
                        type="button"
                        className="mentor-reject-button"
                        disabled={respondingId !== null}
                        onClick={() =>
                          handleRespond(
                            application._id,
                            "rejected"
                          )
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="mentor-dashboard-empty">
                  No pending job offers.
                </p>
              )}
            </div>
          </section>

          {/* APPLICATIONS SENT */}
          <section className="mentor-dashboard-section mentor-applications-section">
            <h2 className="mentor-dashboard-title">
              Applications sent
            </h2>

            <p className="mentor-dashboard-subtitle">
              Jobs you have applied to
            </p>

            <div className="mentor-dashboard-list">
              {loading ? (
                <p className="mentor-dashboard-empty">
                  Loading applications...
                </p>
              ) : applicationsSent.length > 0 ? (
                applicationsSent.map((application) => (
                  <div
                    key={application._id}
                    className="mentor-application-row"
                  >
                    <span className="mentor-job-name">
                      {getJobName(application)}
                    </span>

                    <span
                      className="mentor-application-status"
                      title={`Application status: ${application.status}`}
                    >
                      <Clock3 size={15} strokeWidth={1.5} />
                    </span>
                  </div>
                ))
              ) : (
                <p className="mentor-dashboard-empty">
                  No applications sent yet.
                </p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
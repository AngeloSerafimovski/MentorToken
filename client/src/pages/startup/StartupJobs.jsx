import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import JobCard from "../../components/jobs/JobCard/JobCard";
import api from "../../api/axios";

import "./StartupJobs.css";

function StartupJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applicantsCounts, setApplicantsCounts] = useState({});
  const [assignedMentors, setAssignedMentors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Go zemame najaveniot korisnik od localStorage
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const companyName = user?.startupName || "My Startup";

  // Gi prezemame rabotite i nivnite aplikacii od MongoDB
  useEffect(() => {
    let isActive = true;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        // Prvo gi prezemame site Jobs na startupot
        const jobsResponse = await api.get("/jobs/my-jobs");

        const fetchedJobs = Array.isArray(jobsResponse.data)
          ? jobsResponse.data
          : [];

        // Za sekoj Job gi prezemame aplikaciite
        const applicationsResponses = await Promise.all(
          fetchedJobs.map((job) =>
            api.get(`/applications/job/${job._id}`)
          )
        );

        // Objekti za brojot na aplikacii i prifatenite mentori
        const counts = {};
        const mentors = {};

        fetchedJobs.forEach((job, index) => {
          const responseData = applicationsResponses[index].data;

          const applications = Array.isArray(responseData)
            ? responseData.filter(
                (application) =>
                  application.applicationType === "mentorToCompany"
              )
            : [];

          // Vkupen broj na aplikacii za konkretniot Job
          counts[job._id] = applications.length;

          // Go pronajduvame prifateniot mentor
          const acceptedApplication = applications.find(
            (application) => application.status === "accepted"
          );

          if (acceptedApplication?.mentorId) {
            const mentor = acceptedApplication.mentorId;

            // Ime i prezime od MongoDB
            const fullName = [
              mentor.firstName,
              mentor.lastName,
            ]
              .filter(Boolean)
              .join(" ")
              .trim();

            mentors[job._id] =
              fullName || mentor.email || "Assigned Mentor";
          }
        });

        if (!isActive) return;

        setJobs(fetchedJobs);
        setApplicantsCounts(counts);
        setAssignedMentors(mentors);
      } catch (err) {
        if (!isActive) return;

        console.error(
          "Failed to fetch jobs:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            "Failed to load jobs. Please try again."
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="startup-jobs">
      <div className="startup-jobs-header">
        <h1>Your Startup Jobs</h1>

        <button
          type="button"
          className="startup-jobs-create-button"
          onClick={() => navigate("/startup/jobs/create")}
        >
          + Create New Job
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="startup-jobs-empty">
          Loading jobs...
        </p>
      )}

      {/* ERROR */}
      {!loading && error && (
        <p className="startup-jobs-empty">
          {error}
        </p>
      )}

      {/* JOBS LIST */}
      {!loading && !error && (
        <div className="startup-jobs-grid">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                companyName={companyName}
                applicantsCount={applicantsCounts[job._id] ?? 0}
                assignedMentor={assignedMentors[job._id] || ""}
                variant="startup"
              />
            ))
          ) : (
            <p className="startup-jobs-empty">
              You haven't created any jobs yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StartupJobs;
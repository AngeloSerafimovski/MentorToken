import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

import MentorCard from "../../components/startup/MentorCard/MentorCard";
import MentorsOverview from "../../components/startup/MentorsOverview/MentorsOverview";
import AddMentorModal from "../../components/startup/AddMentorModal/AddMentorModal";

import mentorsIllustration from "../../assets/Images/Mentors/illustration.svg";

import "./StartupMentors.css";

function StartupMentors() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [availableMentors, setAvailableMentors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gi prezemame mentorite i aplikaciite od MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          allMentorsResponse,
          myMentorsResponse,
          applicationsResponse,
        ] = await Promise.all([
          api.get("/mentors"),
          api.get("/mentors/my"),
          api.get("/applications/my"),
        ]);

        setAvailableMentors(
          Array.isArray(allMentorsResponse.data)
            ? allMentorsResponse.data
            : []
        );

        setMentors(
          Array.isArray(myMentorsResponse.data)
            ? myMentorsResponse.data
            : []
        );

        setApplications(
          Array.isArray(applicationsResponse.data)
            ? applicationsResponse.data
            : []
        );
      } catch (err) {
        console.error("Error loading mentors:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load mentors."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gi prilagoduvame podatocite za postoechkite komponenti
  const formatMentor = (mentor) => ({
    ...mentor,
    name: `${mentor.firstName || ""} ${mentor.lastName || ""}`.trim(),
    desc: mentor.description || "",
  });

  const formattedMentors = mentors.map(formatMentor);
  const formattedAvailableMentors = availableMentors.map(formatMentor);

  const addedMentorIds = mentors.map((mentor) => mentor._id);

  // Dodavanje mentor preku backendot
  const handleAddMentor = async (mentor) => {
    try {
      await api.post("/mentors/add", {
        mentorId: mentor._id,
      });

      // Ja osvezhuvame listata direktno od MongoDB
      const response = await api.get("/mentors/my");

      setMentors(response.data);

      return true;
    } catch (err) {
      console.error("Error adding mentor:", err);

      throw new Error(
        err.response?.data?.message ||
          "Failed to add mentor."
      );
    }
  };

  // Quick Overview
  const totalMentors = mentors.length;

  const assignedApplications = applications.filter((application) => {
    const mentorId =
      typeof application.mentorId === "object"
        ? application.mentorId?._id
        : application.mentorId;

    return (
      addedMentorIds.includes(mentorId) &&
      application.status === "accepted"
    );
  });

  const totalAssignedJobs = assignedApplications.length;

  const finishedJobs = assignedApplications.filter(
    (application) => application.acceptedStatus === "done"
  ).length;

  return (
    <div className="startup-mentors">
      {/* Banner */}
      <section className="startup-mentors-banner">
        <div className="startup-mentors-banner-content">
          <h1>My Mentors</h1>
          <p>Monitor and add new mentors</p>

          <button
            type="button"
            className="add-mentor-button"
            onClick={() => setIsModalOpen(true)}
          >
            + Add New Mentor
          </button>
        </div>

        <img
          src={mentorsIllustration}
          alt=""
          className="startup-mentors-banner-image"
        />
      </section>

      {/* Mentor karticki i statistika */}
      <div className="startup-mentors-grid">
        <div className="startup-mentors-list">
          {loading ? (
            <div className="startup-mentors-empty">
              <p>Loading mentors...</p>
            </div>
          ) : error ? (
            <div className="startup-mentors-empty">
              <p>{error}</p>
            </div>
          ) : formattedMentors.length > 0 ? (
            formattedMentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
                onViewMentor={(selectedMentor) =>
                  navigate(
                    `/startup/mentors/${selectedMentor._id}`
                  )
                }
              />
            ))
          ) : (
            <div className="startup-mentors-empty">
              <h3>No mentors added yet</h3>
              <p>
                Click Add New Mentor to find and add a registered mentor.
              </p>
            </div>
          )}
        </div>

        <div className="startup-mentors-overview">
          <MentorsOverview
            totalMentors={totalMentors}
            totalAssignedJobs={totalAssignedJobs}
            finishedJobs={finishedJobs}
          />
        </div>
      </div>

      {/* Modal za dodavanje mentor */}
      {isModalOpen && (
        <AddMentorModal
          onClose={() => setIsModalOpen(false)}
          onAddMentor={handleAddMentor}
          addedMentorIds={addedMentorIds}
          availableMentors={formattedAvailableMentors}
        />
      )}
    </div>
  );
}

export default StartupMentors;
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import api from "../../api/axios";

import MentorProfile from "../../components/startup/MentorProfile/MentorProfile";
import MentorAbout from "../../components/startup/MentorAbout/MentorAbout";
import MentorAssignedJobs from "../../components/dashboard/MentorAssignedJobs/MentorAssignedJobs";
import PendingJobOffers from "../../components/dashboard/PendingJobOffers/PendingJobOffers";
import OfferJobModal from "../../components/startup/OfferJobModal/OfferJobModal";

import "./ViewMentor.css";

function ViewMentor() {
  const { mentorId } = useParams();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offersRefreshKey, setOffersRefreshKey] = useState(0);
  

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await api.get(`/mentors/${mentorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const mentorData = response.data;

        setMentor({
          ...mentorData,
          name: `${mentorData.firstName || ""} ${mentorData.lastName || ""}`.trim(),
          desc: mentorData.description || "",
        });
      } catch (error) {
        console.error("Error fetching mentor:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load mentor information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="view-mentor">
        <p>Loading mentor...</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="view-mentor">
        <h2>{error || "Mentor not found"}</h2>
        <Link to="/startup/mentors">Back to My Mentors</Link>
      </div>
    );
  }

  return (
    <div className="view-mentor">
      <div className="view-mentor-top">
        <MentorProfile mentor={mentor} />

        <MentorAbout
  mentor={mentor}
  onOfferJob={() => setShowOfferModal(true)}
/>
      </div>

      <div className="view-mentor-bottom">
        <section className="view-mentor-jobs">
          <MentorAssignedJobs mentorId={mentorId} />
        </section>

        <section className="view-mentor-offers">
          <PendingJobOffers
  mentorId={mentorId}
  refreshKey={offersRefreshKey}
/>
        </section>
      </div>
      {showOfferModal && (
  <OfferJobModal
    mentor={mentor}
    onClose={() => setShowOfferModal(false)}
    onOfferSent={() => {
    setOffersRefreshKey((prev) => prev + 1);
  }}
  />
)}
    </div>
  );
}

export default ViewMentor;
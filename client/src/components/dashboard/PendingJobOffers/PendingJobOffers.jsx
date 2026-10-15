import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./PendingJobOffers.css";

function PendingJobOffers({ mentorId, refreshKey = 0 }) {
  const [pendingOffers, setPendingOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPendingOffers = async () => {
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

        // Filtriranje na pending ponudi isprateni do konkretniot mentor
        const offers = response.data.filter((application) => {
          const applicationMentorId =
            typeof application.mentorId === "object"
              ? application.mentorId?._id
              : application.mentorId;

          return (
            applicationMentorId === mentorId &&
            application.applicationType === "companyToMentor" &&
            application.status === "pending"
          );
        });

        setPendingOffers(offers);
      } catch (error) {
        console.error("Greshka pri prezemanje na ponudite:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load pending job offers."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOffers();
  }, [mentorId, refreshKey]);

  const handleCancelOffer = async (applicationId) => {
    // Potvrda pred otkazhuvanje na ponudata
    const confirmed = window.confirm(
      "Are you sure you want to cancel this job offer?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(applicationId);
      setError("");

      const token = localStorage.getItem("token");

      // Isprakjanje baranje do backend za otkazhuvanje
      await api.patch(
        `/applications/${applicationId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Otstranuvanje na otkazhanata ponuda od listata
      setPendingOffers((previousOffers) =>
        previousOffers.filter(
          (offer) => offer._id !== applicationId
        )
      );
    } catch (error) {
      console.error("Greshka pri otkazhuvanje na ponudata:", error);

      setError(
        error.response?.data?.message ||
          "Failed to cancel job offer."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="pending-job-offers">
      <h2>Pending Job Offers</h2>

      <div className="pending-offers-list">
        {loading ? (
          <p className="pending-offers-empty">
            Loading job offers...
          </p>
        ) : (
          <>
            {error && (
              <p className="offer-job-error">{error}</p>
            )}

            {pendingOffers.length > 0 ? (
              pendingOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="pending-offer-row"
                >
                  <span className="pending-offer-title">
                    {offer.jobName ||
                      offer.jobId?.title ||
                      "Unknown Job"}
                  </span>

                  <button
                    type="button"
                    className="pending-offer-cancel"
                    onClick={() => handleCancelOffer(offer._id)}
                    disabled={cancellingId === offer._id}
                  >
                    {cancellingId === offer._id
                      ? "Cancelling..."
                      : "Cancel Offer"}
                  </button>
                </div>
              ))
            ) : (
              <p className="pending-offers-empty">
                No pending job offers.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PendingJobOffers;
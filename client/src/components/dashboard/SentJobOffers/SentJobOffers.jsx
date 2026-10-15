import { useState } from "react";
import "./SentJobOffers.css";

function SentJobOffers({ applications = [] }) {
  const [showAll, setShowAll] = useState(false);

  // Gi izdvojuvame samo direktnite ponudi isprateni od Startup
  const sentOffers = applications
    .filter(
      (application) =>
        application.applicationType === "companyToMentor"
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

  // Prikazuvame najmnogo 3 ponudi, osven ako e izbrano View All
  const visibleOffers = showAll
    ? sentOffers
    : sentOffers.slice(0, 3);

  // Ime na mentorot
  const getMentorName = (offer) => {
    const mentor = offer.mentorId;

    if (!mentor || typeof mentor !== "object") {
      return "Unknown Mentor";
    }

    const fullName = [
      mentor.firstName,
      mentor.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || mentor.email || "Mentor";
  };

  // Status na ponudata
  const getOfferStatus = (offer) => {
    if (offer.status === "accepted") {
      if (offer.acceptedStatus === "done") {
        return {
          label: "Done",
          className: "done",
        };
      }

      return {
        label: "In Progress",
        className: "accepted",
      };
    }

    const statuses = {
      pending: {
        label: "Pending",
        className: "pending",
      },
      rejected: {
        label: "Rejected",
        className: "rejected",
      },
      cancelled: {
        label: "Cancelled",
        className: "cancelled",
      },
    };

    return (
      statuses[offer.status] || {
        label: "Unknown",
        className: "cancelled",
      }
    );
  };

  return (
    <section className="sent-job-offers">
      <div className="sent-job-offers-header">
        <h2>Sent Job Offers</h2>

        {sentOffers.length > 3 && (
          <button
            type="button"
            className="sent-job-offers-view-all"
            onClick={() => setShowAll((previous) => !previous)}
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        )}
      </div>

      <div className="sent-job-offers-list">
        {sentOffers.length === 0 ? (
          <p className="sent-job-offers-empty">
            No job offers sent yet.
          </p>
        ) : (
          visibleOffers.map((offer) => {
            const mentorName = getMentorName(offer);
            const status = getOfferStatus(offer);

            return (
              <div
                key={offer._id}
                className="sent-job-offer-card"
              >
                <div className="sent-job-offer-avatar">
                  {mentorName.charAt(0).toUpperCase()}
                </div>

                <div className="sent-job-offer-info">
                  <h3>{mentorName}</h3>

                  <p>
                    {offer.jobName || "Job Offer"}
                  </p>
                </div>

                <span
                  className={`sent-job-offer-status ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default SentJobOffers;
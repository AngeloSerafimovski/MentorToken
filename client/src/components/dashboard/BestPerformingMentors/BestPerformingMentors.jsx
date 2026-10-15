import { ArrowUpRight } from "lucide-react";

import "./BestPerformingMentors.css";

function BestPerformingMentors({ applications = [] }) {
  // Gi zemame prifatenite angazhmani
  const acceptedApplications = applications.filter(
    (application) =>
      application.status === "accepted" &&
      application.mentorId
  );

  // Gi grupirame angazhmanite spored mentor
  const mentorsMap = {};

  acceptedApplications.forEach((application) => {
    const mentor = application.mentorId;

    // mentorId e popolnet so populate() od backendot
    if (!mentor || typeof mentor !== "object") return;

    const mentorId = mentor._id;

    if (!mentorId) return;

    if (!mentorsMap[mentorId]) {
      mentorsMap[mentorId] = {
        _id: mentorId,
        name:
          [mentor.firstName, mentor.lastName]
            .filter(Boolean)
            .join(" ") || mentor.email || "Unknown Mentor",
        achievedJobs: 0,
        assignedJobs: 0,
      };
    }

    mentorsMap[mentorId].assignedJobs++;

    // Achieved Jobs se samo zavrshenite angazhmani
    if (application.acceptedStatus === "done") {
      mentorsMap[mentorId].achievedJobs++;
    }
  });

  // Rangiranje spored zavrsheni, pa spored dodeleni Jobs
  const topMentors = Object.values(mentorsMap)
    .sort(
      (a, b) =>
        b.achievedJobs - a.achievedJobs ||
        b.assignedJobs - a.assignedJobs
    )
    .slice(0, 3);

  return (
    <section className="best-mentors">
      <h2 className="best-mentors-title">
        Best Performing Mentors
      </h2>

      <div className="best-mentors-card">
        {topMentors.length > 0 ? (
          topMentors.map((mentor) => (
            <div className="best-mentor-item" key={mentor._id}>
              <div className="best-mentor-info">
                <div className="best-mentor-avatar">
                  {mentor.name.charAt(0).toUpperCase()}
                </div>

                <div className="best-mentor-details">
                  <span className="best-mentor-name">
                    {mentor.name}
                  </span>

                  <span className="best-mentor-jobs">
                    {mentor.achievedJobs} Achieved Jobs
                  </span>
                </div>
              </div>

              <span className="best-mentor-arrow">
                <ArrowUpRight size={20} strokeWidth={1.8} />
              </span>
            </div>
          ))
        ) : (
          <p
            style={{
              padding: "20px",
              color: "#8995aa",
              fontSize: "13px",
            }}
          >
            No assigned mentors yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default BestPerformingMentors;
import "./MentorsOverview.css";

function MentorsOverview({ totalMentors, totalAssignedJobs, finishedJobs }) {
  return (
    <section className="mentors-overview">
      <div className="mentors-overview-heading">
        <h2>Quick Overview</h2>
        <p>In the last month</p>
      </div>

      <div className="mentors-overview-stats">
        <div className="mentors-overview-card">
          <span>Total Mentors</span>
          <strong>{totalMentors}</strong>
        </div>

        <div className="mentors-overview-card">
          <span>Total Assigned Jobs</span>
          <strong>{totalAssignedJobs}</strong>
        </div>

        <div className="mentors-overview-card featured">
          <span>Finished Jobs</span>
          <strong>{finishedJobs}</strong>
        </div>
      </div>
    </section>
  );
}

export default MentorsOverview;
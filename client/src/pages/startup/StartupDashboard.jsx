import { useEffect, useState } from "react";

import api from "../../api/axios";

import AssignedJobs from "../../components/dashboard/AssignedJobs/AssignedJobs";
import BestPerformingMentors from "../../components/dashboard/BestPerformingMentors/BestPerformingMentors";
import OverallStatistics from "../../components/dashboard/OverallStatistics/OverallStatistics";

import "./StartupDashboard.css";

function StartupDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gi prezemame aplikaciite i direktnite ponudi na najaveniot Startup
  useEffect(() => {
    let active = true;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/applications/my");

        if (!active) return;

        setApplications(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        if (!active) return;

        console.error("Failed to load startup applications:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchApplications();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="startup-dashboard">
      {loading ? (
        <p>Loading dashboard...</p>
      ) : error ? (
        <p style={{ color: "#d83b4d" }}>{error}</p>
      ) : (
        <div className="startup-dashboard-grid">
          <div className="startup-dashboard-left">
            <AssignedJobs applications={applications} />
          </div>

          <div className="startup-dashboard-right">
            <BestPerformingMentors applications={applications} />

            {/* Grafikonoт go ostavame nepromenet */}
            <OverallStatistics />
          </div>
        </div>
      )}
    </div>
  );
}

export default StartupDashboard;
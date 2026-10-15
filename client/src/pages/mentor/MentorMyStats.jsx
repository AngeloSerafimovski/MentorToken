import { useEffect, useState } from "react";
import { Mail, Phone, Pencil, X } from "lucide-react";

import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";

import api from "../../api/axios";
import "./MentorMyStats.css";

// Registracija na Chart.js komponentite
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

function MentorMyStats() {
  const [mentor, setMentor] = useState(null);
  const [applications, setApplications] = useState([]);
  const [openJobs, setOpenJobs] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    skills: "",
    description: "",
  });

  // Prezemanje na podatoci od MongoDB
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileRes, applicationsRes, jobsRes] =
          await Promise.all([
            api.get("/auth/me"),
            api.get("/applications/my"),
            api.get("/jobs/feed"),
          ]);

        if (!active) return;

        setMentor(profileRes.data.user);

        setApplications(
          Array.isArray(applicationsRes.data)
            ? applicationsRes.data
            : []
        );

        setOpenJobs(
          Array.isArray(jobsRes.data)
            ? jobsRes.data.length
            : 0
        );
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Failed to load your statistics."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  // Otvaranje na Edit Profile
  const handleEdit = () => {
    setFormData({
      firstName: mentor?.firstName || "",
      lastName: mentor?.lastName || "",
      phone: mentor?.phone || "",
      skills: mentor?.skills?.join(", ") || "",
      description: mentor?.description || "",
    });

    setSaveError("");
    setIsEditing(true);
  };

  // Zachuvuvanje na profilot vo MongoDB
  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSaveError("");

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        description: formData.description.trim(),
      };

      const response = await api.patch("/auth/profile", payload);

      setMentor(response.data.user);

      // Azhuriranje na localStorage
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            ...response.data.user,
          })
        );
      }

      setIsEditing(false);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Mentor podatoci
  const fullName = mentor
    ? [mentor.firstName, mentor.lastName].filter(Boolean).join(" ")
    : "";

  const initials =
    [mentor?.firstName?.[0], mentor?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "M";

  // Realni statistiki od aplikaciite
  const appliedJobs = applications.filter(
    (app) => app.applicationType === "mentorToCompany"
  );

  const assignedJobs = applications.filter(
    (app) => app.status === "accepted"
  );

  const finishedJobs = assignedJobs.filter(
    (app) => app.acceptedStatus === "done"
  );

  // Mesecni podatoci za grafikonoт
  const currentYear = new Date().getFullYear();

  const monthlyStats = Array(12).fill(0);

  assignedJobs.forEach((app) => {
    if (!app.updatedAt) return;

    const date = new Date(app.updatedAt);

    if (date.getFullYear() === currentYear) {
      monthlyStats[date.getMonth()]++;
    }
  });

  // Chart.js podatoci
  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Accepted Jobs",
        data: monthlyStats,
        borderColor: "#696cff",
        backgroundColor: "rgba(105, 108, 255, 0.12)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart.js konfiguracija
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        grid: {
          color: "#edf0f5",
        },
        border: {
          display: false,
        },
      },

      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="mentor-my-stats">
        <p>Loading your statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mentor-my-stats">
        <p className="mentor-stats-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="mentor-my-stats">
      <h1 className="mentor-my-stats-title">My Stats</h1>

      {/* PROFILE I ABOUT */}
      <div className="mentor-stats-top-grid">
        <section className="mentor-stats-profile-card">
          <div className="mentor-stats-avatar">
            {initials}
          </div>

          <h2>{fullName || "Mentor"}</h2>

          <p className="mentor-stats-role">Mentor</p>

          <div className="mentor-stats-contact">
            <div>
              <Mail size={15} />
              <span>{mentor?.email || "No email available"}</span>
            </div>

            <div>
              <Phone size={15} />
              <span>{mentor?.phone || "No phone available"}</span>
            </div>
          </div>
        </section>

        <section className="mentor-stats-about-card">
          <div className="mentor-stats-about-header">
            <h2>About</h2>

            <button
              type="button"
              className="mentor-stats-edit-button"
              onClick={handleEdit}
              aria-label="Edit profile"
            >
              <Pencil size={18} />
            </button>
          </div>

          <p className="mentor-stats-skills">
            <strong>Skills:</strong>{" "}
            {mentor?.skills?.length
              ? mentor.skills.join(" | ")
              : "No skills added yet"}
          </p>

          <p className="mentor-stats-description">
            {mentor?.description || "No description added yet."}
          </p>
        </section>
      </div>

      {/* GRAFIKON I QUICK OVERVIEW */}
      <div className="mentor-stats-bottom-grid">
        <section className="mentor-stats-performance">
          <h2>Performance Over Time</h2>

          <div className="mentor-stats-chart-card">
            <h3>STATISTICS</h3>

            <p>
              Accepted jobs activity in {currentYear}
            </p>

            <div className="mentor-stats-chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </section>

        <section className="mentor-stats-overview">
          <h2>Quick Overview</h2>

          <div className="mentor-stats-overview-cards">
            <div className="mentor-stats-overview-card">
              <span>Open Jobs</span>
              <strong>{openJobs}</strong>
            </div>

            <div className="mentor-stats-overview-card">
              <span>Total Assigned Jobs</span>
              <strong>{assignedJobs.length}</strong>
            </div>

            <div className="mentor-stats-overview-card">
              <span>Jobs That You Have Applied</span>
              <strong>{appliedJobs.length}</strong>
            </div>

            <div className="mentor-stats-overview-card mentor-stats-overview-highlight">
              <span>Finished Jobs</span>
              <strong>{finishedJobs.length}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="mentor-stats-modal-overlay">
          <div
            className="mentor-stats-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="mentor-stats-modal-header">
              <h2>Edit Profile</h2>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <label>
                First Name
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstName: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Last Name
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastName: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Phone
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Skills (separate with commas)
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skills: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </label>

              {saveError && (
                <p className="mentor-stats-error">
                  {saveError}
                </p>
              )}

              <div className="mentor-stats-modal-actions">
                <button
                  type="button"
                  className="mentor-stats-cancel-button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="mentor-stats-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorMyStats;
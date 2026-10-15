import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

import api from "../../../api/axios";

import "./OverallStatistics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

function OverallStatistics() {
  const [statistics, setStatistics] = useState({
    months: [],
    acceptedJobs: [],
    completedJobs: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Prezemanјe na realnite statistiki od backend
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get(
          "/statistics/overview"
        );

        setStatistics(response.data);
      } catch (error) {
        console.error(
          "Failed to fetch statistics:",
          error
        );

        setError("Unable to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const data = {
    labels: statistics.months,

    datasets: [
      {
        label: "Accepted Jobs",

        data: statistics.acceptedJobs,

        borderColor: "#696cff",

        backgroundColor: "rgba(105, 108, 255, 0.08)",

        borderWidth: 3,

        tension: 0.4,

        fill: true,

        pointRadius: 3,

        pointHoverRadius: 6,

        pointHoverBackgroundColor: "#696cff",
      },

      {
        label: "Completed Jobs",

        data: statistics.completedJobs,

        borderColor: "#22c55e",

        backgroundColor: "rgba(34, 197, 94, 0.05)",

        borderWidth: 3,

        tension: 0.4,

        fill: false,

        pointRadius: 3,

        pointHoverRadius: 6,

        pointHoverBackgroundColor: "#22c55e",
      },
    ],
  };

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: true,

        position: "top",

        align: "end",

        labels: {
          usePointStyle: true,

          boxWidth: 8,

          padding: 20,
        },
      },

      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        border: {
          display: false,
        },

        ticks: {
          color: "#999999",

          font: {
            size: 11,
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,

          stepSize: 1,

          color: "#999999",
        },

        grid: {
          color: "#f0f0f0",
        },

        border: {
          display: false,
        },
      },
    },
  };

  return (
    <section className="overall-statistics">
      <h2 className="overall-statistics-heading">
        OVERALL STATISTIC
      </h2>

      <div className="overall-statistics-card">
        <h3 className="statistics-title">
          STATISTICS
        </h3>

        <p className="statistics-description">
          Accepted and completed jobs over the last 12 months
        </p>

        {loading ? (
          <p>Loading statistics...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="statistics-chart">
            <Line data={data} options={options} />
          </div>
        )}
      </div>
    </section>
  );
}

export default OverallStatistics;
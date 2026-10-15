const Application = require("../models/Application");

// GET /api/statistics/overview
const getOverviewStatistics = async (req, res) => {
  try {
    // Proveruvame dali e najaven startup ili mentor
    const filter =
      req.user.role === "startup"
        ? { companyId: req.user._id }
        : { mentorId: req.user._id };

    // Gi prezemame samo prifatenite angazhmani
    const applications = await Application.find({
      ...filter,
      status: "accepted",
    }).select("acceptedAt completedAt acceptedStatus");

    // Poslednite 12 meseci
    const now = new Date();

    const months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
      );

      months.push({
        year: date.getUTCFullYear(),
        month: date.getUTCMonth(),
        label: date.toLocaleString("en-US", {
          month: "short",
          timeZone: "UTC",
        }),
        accepted: 0,
        completed: 0,
      });
    }

    // Gi rasporeduvame angazhmanite po meseci
    applications.forEach((application) => {
      if (application.acceptedAt) {
        const acceptedDate = new Date(application.acceptedAt);

        const month = months.find(
          (item) =>
            item.year === acceptedDate.getUTCFullYear() &&
            item.month === acceptedDate.getUTCMonth()
        );

        if (month) {
          month.accepted++;
        }
      }

      if (
        application.acceptedStatus === "done" &&
        application.completedAt
      ) {
        const completedDate = new Date(application.completedAt);

        const month = months.find(
          (item) =>
            item.year === completedDate.getUTCFullYear() &&
            item.month === completedDate.getUTCMonth()
        );

        if (month) {
          month.completed++;
        }
      }
    });

    return res.status(200).json({
      months: months.map((item) => item.label),
      acceptedJobs: months.map((item) => item.accepted),
      completedJobs: months.map((item) => item.completed),
    });
  } catch (error) {
    console.error("Get statistics error:", error);

    return res.status(500).json({
      message: "Server error while fetching statistics",
    });
  }
};

module.exports = {
  getOverviewStatistics,
};
import DashboardSidebar from "../dashboard/DashboardSidebar/DashboardSidebar";

import {
  LayoutDashboard,
  ChartNoAxesCombined,
  CircleDot,
} from "lucide-react";

function MentorSidebar() {
  // Navigacija za mentor korisnicite
  const mentorMenuItems = [
    {
      label: "Dashboard",
      path: "/mentor/dashboard",
      icon: <LayoutDashboard size={19} strokeWidth={1.8} />,
    },
    {
      label: "My Stats",
      path: "/mentor/stats",
      icon: <ChartNoAxesCombined size={19} strokeWidth={1.8} />,
    },
    {
      label: "Job Feed",
      path: "/mentor/jobs",
      icon: <CircleDot size={19} strokeWidth={1.8} />,
    },
  ];

  return <DashboardSidebar menuItems={mentorMenuItems} />;
}

export default MentorSidebar;
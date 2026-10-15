import DashboardSidebar from "../dashboard/DashboardSidebar/DashboardSidebar";

import {
  LayoutDashboard,
  UserRound,
  CircleDot,
} from "lucide-react";

function StartupSidebar() {
  const startupMenuItems = [
    {
      label: "Dashboard",
      path: "/startup/dashboard",
      icon: <LayoutDashboard size={19} strokeWidth={1.8} />,
    },
    {
      label: "Mentors",
      path: "/startup/mentors",
      icon: <UserRound size={19} strokeWidth={1.8} />,
    },
    {
      label: "Jobs",
      path: "/startup/jobs",
      icon: <CircleDot size={19} strokeWidth={1.8} />,
    },
  ];

  return <DashboardSidebar menuItems={startupMenuItems} />;
}

export default StartupSidebar;

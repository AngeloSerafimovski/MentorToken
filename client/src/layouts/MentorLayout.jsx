import { Outlet } from "react-router-dom";

import MentorSidebar from "../components/mentor/MentorSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader/DashboardHeader";

import "./MentorLayout.css";

function MentorLayout() {
  return (
    <div className="mentor-layout">
      <MentorSidebar />

      <main className="mentor-content">
        <DashboardHeader />

        <Outlet />
      </main>
    </div>
  );
}

export default MentorLayout;

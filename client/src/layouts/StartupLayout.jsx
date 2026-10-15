import { Outlet } from "react-router-dom";

import StartupSidebar from "../components/startup/StartupSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader/DashboardHeader";

import "./StartupLayout.css";

function StartupLayout() {
  return (
    <div className="startup-layout">
      <StartupSidebar />

      <main className="startup-content">
        <DashboardHeader />

        <Outlet />
      </main>
    </div>
  );
}

export default StartupLayout;
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import mentorTokenIcon from "../../../assets/Icons/Vector.svg";
import collapseIcon from "../../../assets/Icons/collapse.svg";
import extendIcon from "../../../assets/Icons/extend.svg";
import { LogOut } from "lucide-react";

import "./DashboardSidebar.css";

function DashboardSidebar({ menuItems }) {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed((previousState) => !previousState);
  };

  return (
    <aside
      className={`dashboard-sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <div className="dashboard-sidebar-logo">
        <img
          src={mentorTokenIcon}
          alt="Mentor Token"
          className="dashboard-logo-icon"
        />

        {!isCollapsed && (
          <span className="dashboard-logo-text">
            Mentor Token
          </span>
        )}
      </div>

      <button
        className="sidebar-collapse-button"
        onClick={toggleSidebar}
        type="button"
        aria-label={
          isCollapsed ? "Expand sidebar" : "Collapse sidebar"
        }
      >
        <img
          src={isCollapsed ? extendIcon : collapseIcon}
          alt=""
        />
      </button>

      <nav className="dashboard-sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="dashboard-nav-icon">
              {item.icon}
            </span>

            {!isCollapsed && (
              <span className="dashboard-nav-label">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <button
  className="dashboard-logout"
  onClick={handleLogout}
>
  <span className="dashboard-nav-icon">
    <LogOut size={19} strokeWidth={1.8} />
  </span>

  {!isCollapsed && <span>Logout</span>}
</button>
    </aside>
  );
}

export default DashboardSidebar;
import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { App } from "./App.jsx";

// Layouts
import PublicLayout from "./layouts/PublicLayout.jsx";
import AuthLayout from "./layouts/AuthLayout/AuthLayout.jsx";
import StartupLayout from "./layouts/StartupLayout.jsx";
import MentorLayout from "./layouts/MentorLayout.jsx";

// Public pages
import Home from "./pages/public/Home.jsx";
import About from "./pages/public/About.jsx";
import Contact from "./pages/public/Contact.jsx";

// Auth pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import SetupStartup from "./pages/auth/SetupStartup.jsx";

// Startup & Mentor pages
import StartupDashboard from "./pages/startup/StartupDashboard.jsx";
import StartupMentors from "./pages/startup/StartupMentors.jsx";
import ViewMentor from "./pages/startup/ViewMentor.jsx";
import StartupJobs from "./pages/startup/StartupJobs.jsx";
import CreateJob from "./pages/startup/CreateJob.jsx";
import ViewJob from "./pages/startup/ViewJob.jsx";


import SetupMentor from "./pages/auth/SetupMentor.jsx";
import MentorDashboard from "./pages/mentor/MentorDashboard.jsx";
import MentorJobFeed from "./pages/mentor/MentorJobFeed";
import MentorMyStats from "./pages/mentor/MentorMyStats.jsx";

// Protected Route
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// Global styles
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>

          {/* PUBLIC ROUTES */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* AUTH ROUTES */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="register/mentor" element={<SetupMentor />} />

            <Route
              path="register/startup"
              element={<SetupStartup />}
            />
          </Route>

          {/* STARTUP ROUTES */}
          <Route
            path="startup"
            element={
              <ProtectedRoute allowedRoles={["startup"]}>
                <StartupLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route
              path="dashboard"
              element={<StartupDashboard />}
            />

            <Route
              path="mentors"
              element={<StartupMentors />}
            />

            <Route
              path="mentors/:mentorId"
              element={<ViewMentor />}
            />

            <Route
              path="jobs"
              element={<StartupJobs />}
            />

            <Route path="jobs/create" element={<CreateJob />} />
            <Route path="jobs/:jobId" element={<ViewJob />} />
          </Route>

          {/* MENTOR ROUTES */}
<Route
  path="mentor"
  element={
    <ProtectedRoute allowedRoles={["mentor"]}>
      <MentorLayout />
    </ProtectedRoute>
  }
>
  <Route
    index
    element={<Navigate to="dashboard" replace />}
  />

  <Route
    path="dashboard"
    element={<MentorDashboard />}
  />

  {/* Mentor My Stats */}
  <Route
    path="stats"
    element={<MentorMyStats />}
  />

  <Route
    path="jobs"
    element={<MentorJobFeed />}
  />
</Route>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

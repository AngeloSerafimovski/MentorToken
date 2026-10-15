import { Outlet } from "react-router-dom";
import AuthSidebar from "../../components/auth/AuthSidebar/AuthSidebar.jsx";
import "./AuthLayout.css";

function AuthLayout() {
  return (
    <div className="auth-layout">
      <AuthSidebar />

      <main className="auth-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
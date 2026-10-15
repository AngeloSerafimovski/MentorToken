import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === "startup"
        ? "/startup/dashboard"
        : user.role === "mentor"
        ? "/mentor/dashboard"
        : "/login";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
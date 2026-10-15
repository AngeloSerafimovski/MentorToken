import "./Login.css";
import logoIcon from "../../assets/Icons/Vector.svg";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../api/axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const loginData = {
      email,
      password,
    };

    try {
      const response = await api.post("/auth/login", loginData);

      const { token, user } = response.data;

      // Proverka dali backendot vratil token i korisnik
      if (!token || !user) {
        throw new Error("Invalid login response.");
      }

      // Proverka na korisnichkata uloga
      if (user.role !== "startup" && user.role !== "mentor") {
        throw new Error("Unsupported user role.");
      }

      // Zachuvuvanje na podatocite
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login successful:", user);

      // Navigacija spored korisnichkata uloga
      if (user.role === "startup") {
        navigate("/startup/dashboard", { replace: true });
      } else if (user.role === "mentor") {
        navigate("/mentor/dashboard", { replace: true });
      }
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">

        <div className="login-logo">
          <img src={logoIcon} alt="Mentor Token" />
        </div>

        <h1>LOG IN TO MENTOR TOKEN</h1>

        <p className="login-subtitle">
          Enter your email and pass to login.
        </p>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >
          <div className="login-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="mentortoken@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="forgot-password"
          >
            Forgot password?
          </button>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="register-link">
            Don't have account?{" "}
            <Link to="/register">
              <span>Register.</span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
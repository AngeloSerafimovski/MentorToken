import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SetupMentor.css";

import logoIcon from "../../assets/Icons/Vector.svg";
import api from "../../api/axios";

function SetupMentor() {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, password, accountType } = location.state || {};

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSetupValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    skills.trim() !== "" &&
    acceptedTerms;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isSetupValid || loading) return;

    if (!email || !password || accountType !== "mentor") {
      setError("Registration information is missing. Please start again.");
      return;
    }

    const registrationData = {
      email,
      password,
      accountType,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      description: description.trim(),
    };

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/register", registrationData);

      console.log("Mentor registration successful:", response.data.message);

      navigate("/login", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-mentor-page">
      <div className="setup-mentor-container">
        <div className="setup-mentor-brand-logo">
          <img src={logoIcon} alt="Mentor Token" />
        </div>

        <h1>SETUP MENTOR ACCOUNT</h1>

        <form className="setup-mentor-fields" onSubmit={handleRegister}>
          <div className="setup-mentor-field">
            <label htmlFor="firstName">
              First Name<span>*</span>
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="setup-mentor-field">
            <label htmlFor="lastName">
              Last Name<span>*</span>
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="setup-mentor-field">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="setup-mentor-field">
            <label htmlFor="skills">
              Skills<span>*</span>
            </label>
            <input
              id="skills"
              type="text"
              placeholder="Sales, Marketing, Management"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <small>Separate skills with commas.</small>
          </div>

          <div className="setup-mentor-field">
            <label htmlFor="description">About Me</label>
            <textarea
              id="description"
              placeholder="Tell us about your experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <p className="setup-mentor-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="setup-mentor-register-button"
            disabled={!isSetupValid || loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <label className="setup-mentor-terms">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />

            <span>
              By signing up to create an account I accept Company's{" "}
              <a href="#">Terms of use</a> &{" "}
              <a href="#">Privacy Policy</a>.
            </span>
          </label>
        </form>
      </div>
    </div>
  );
}

export default SetupMentor;
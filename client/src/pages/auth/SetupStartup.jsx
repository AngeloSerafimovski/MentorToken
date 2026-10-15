import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./SetupStartup.css";

import logoIcon from "../../assets/Icons/Vector.svg";
import startupLogo from "../../assets/Images/Auth/StartupLogo.svg";
import startupCamera from "../../assets/Images/Auth/StartupCamera.svg";

import api from "../../api/axios";

function SetupStartup() {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, password, accountType } = location.state || {};

  const [startupName, setStartupName] = useState("");
  const [legalRepresentative, setLegalRepresentative] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Profilna slika
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Osloboduvanje na preview URL koga se menuva slikata
  useEffect(() => {
    if (!profilePicture) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(profilePicture);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [profilePicture]);

  const isSetupValid =
    startupName.trim() !== "" &&
    legalRepresentative.trim() !== "" &&
    businessAddress.trim() !== "" &&
    acceptedTerms;

  // Otvaranje na prozorecot za izbor na slika
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Izbor i validacija na slikata
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setProfilePicture(file);
  };

  // Registracija na startup so profilna slika
  const handleRegister = async (event) => {
    event.preventDefault();

    if (!isSetupValid || loading) return;

    if (!email || !password || accountType !== "startup") {
      setError("Registration data is missing. Please start again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const registrationData = new FormData();

      registrationData.append("email", email);
      registrationData.append("password", password);
      registrationData.append("accountType", accountType);
      registrationData.append("startupName", startupName.trim());
      registrationData.append(
        "legalRepresentative",
        legalRepresentative.trim()
      );
      registrationData.append(
        "businessAddress",
        businessAddress.trim()
      );
      registrationData.append("mentorEmail", mentorEmail.trim());

      if (profilePicture) {
        registrationData.append("profilePicture", profilePicture);
      }

      const response = await api.post(
        "/auth/register",
        registrationData
      );

      // Gi zachuvuvame podatocite za najaveniot korisnik
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/startup/dashboard", { replace: true });
    } catch (err) {
  console.error("Registration failed:", err);
  console.error("Backend response:", err.response?.data);

  setError(
    err.response?.data?.error ||
    err.response?.data?.message ||
    "Registration failed. Please try again."
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-startup-page">
      <div className="setup-startup-container">

        <div className="setup-startup-brand-logo">
          <img src={logoIcon} alt="Mentor Token" />
        </div>

        <h1>SETUP STARTUP ACCOUNT</h1>

        {/* Upload na profilna slika */}
        <div className="startup-logo-upload">

          <img
            src={imagePreview || startupLogo}
            alt="Startup profile"
            className="startup-logo-image"
            style={
              imagePreview
                ? {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }
                : undefined
            }
          />

          <button
            type="button"
            onClick={handleImageClick}
            aria-label="Upload startup profile picture"
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <img
              src={startupCamera}
              alt=""
              className="startup-camera-image"
            />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="setup-startup-fields">

          {error && (
            <p role="alert" style={{ color: "#dc3545" }}>
              {error}
            </p>
          )}

          <div className="setup-startup-field">
            <label htmlFor="startupName">
              Startup Name<span>*</span>
            </label>

            <input
              id="startupName"
              type="text"
              placeholder="My Startup Name"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
            />
          </div>

          <div className="setup-startup-field">
            <label htmlFor="legalRepresentative">
              Legal Representative<span>*</span>
            </label>

            <input
              id="legalRepresentative"
              type="text"
              placeholder="Name and surname"
              value={legalRepresentative}
              onChange={(e) =>
                setLegalRepresentative(e.target.value)
              }
            />
          </div>

          <div className="setup-startup-field">
            <label htmlFor="businessAddress">
              Registered Business Address<span>*</span>
            </label>

            <input
              id="businessAddress"
              type="text"
              placeholder="Registered Business Address"
              value={businessAddress}
              onChange={(e) =>
                setBusinessAddress(e.target.value)
              }
            />
          </div>

          <div className="setup-startup-field">
            <label htmlFor="mentorEmail">
              Invite Mentors via email
            </label>

            <input
              id="mentorEmail"
              type="email"
              placeholder="Enter email address to invite mentor"
              value={mentorEmail}
              onChange={(e) => setMentorEmail(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="setup-register-button"
            disabled={!isSetupValid || loading}
            onClick={handleRegister}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <label className="setup-terms">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) =>
                setAcceptedTerms(e.target.checked)
              }
            />

            <span>
              By signing up to create an account I accept Company's{" "}
              <a href="#">Terms of use</a> &{" "}
              <a href="#">Privacy Policy</a>.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default SetupStartup;
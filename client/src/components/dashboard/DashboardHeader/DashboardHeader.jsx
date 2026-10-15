import { useRef, useState } from "react";
import { Search } from "lucide-react";

import api from "../../../api/axios";

import "./DashboardHeader.css";

function DashboardHeader() {
  // Podatoci za najaveniot korisnik
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  // Ime na korisnikot
  const mentorName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const displayName =
    user?.role === "mentor"
      ? mentorName || user?.email || "Mentor"
      : user?.startupName || user?.email || "Startup";

  // Backend adresa za uploadiranite sliki
  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5000";

  const profilePictureUrl = user?.profilePicture
    ? `${backendUrl}${user.profilePicture}`
    : null;

  // Otvoranje na prozorecot za izbor na slika
  const handleAvatarClick = () => {
    if (uploading) return;

    fileInputRef.current?.click();
  };

  // Upload na nova profilna slika
  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Only JPG, PNG and WebP images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError(
        "Profile picture must be smaller than 2MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();

      formData.append("profilePicture", file);

      // Ja isprakjame slikata do backendot
      const response = await api.patch(
        "/auth/profile-picture",
        formData
      );

      // Go azhurirame korisnikot
      const updatedUser = {
        ...user,
        profilePicture: response.data.profilePicture,
      };

      // Zachuvuvanje vo localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      // Vednash prikazhuvanje na novata slika
      setUser(updatedUser);

    } catch (error) {
      console.error(
        "Profile picture upload failed:",
        error
      );

      setUploadError(
        error.response?.data?.message ||
          "Failed to update profile picture."
      );
    } finally {
      setUploading(false);

      // Dozvoluva povtoren izbor na istata slika
      event.target.value = "";
    }
  };

  return (
    <header className="dashboard-header">

      {/* SEARCH */}
      <div className="dashboard-search">
        <span className="dashboard-search-icon">
          <Search size={19} strokeWidth={1.8} />
        </span>

        <input
          type="text"
          placeholder={
            user?.role === "mentor"
              ? "Search..."
              : "Search Mentor..."
          }
        />
      </div>

      {/* USER PROFILE */}
      <div className="dashboard-user">

        {/* Skrieno pole za izbor na slika */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleProfilePictureChange}
          style={{ display: "none" }}
        />

        {/* Klikabilna profilna slika */}
        <button
          type="button"
          className="dashboard-user-avatar dashboard-avatar-button"
          onClick={handleAvatarClick}
          disabled={uploading}
          title="Change profile picture"
          aria-label="Change profile picture"
        >
          {uploading ? (
            <span className="dashboard-avatar-loading">
              ...
            </span>
          ) : profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={`${displayName} profile`}
              className="dashboard-avatar-image"
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </button>

        <span className="dashboard-user-name">
          {displayName}
        </span>

        {uploadError && (
          <span
            className="dashboard-upload-error"
            role="alert"
          >
            {uploadError}
          </span>
        )}

      </div>
    </header>
  );
}

export default DashboardHeader;
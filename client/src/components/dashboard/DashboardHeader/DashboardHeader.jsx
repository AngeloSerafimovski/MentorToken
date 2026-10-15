import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import api from "../../../api/axios";

import "./DashboardHeader.css";

function DashboardHeader() {
  const navigate = useNavigate();

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
  const searchRef = useRef(null);

  // SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const isStartup = user?.role === "startup";
  const isMentor = user?.role === "mentor";

  // Ime na najaveniot korisnik
  const mentorName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  const displayName = isMentor
    ? mentorName || user?.email || "Mentor"
    : user?.startupName || user?.email || "Startup";

  // Backend adresa za profilnite sliki
  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5000";

  const getProfilePictureUrl = (picture) => {
    if (!picture) return null;

    if (/^https?:\/\//i.test(picture)) {
      return picture;
    }

    return `${backendUrl}${
      picture.startsWith("/") ? "" : "/"
    }${picture}`;
  };

  const profilePictureUrl = getProfilePictureUrl(
    user?.profilePicture
  );

  // Prezemanje podatoci zavisno od ulogata
  useEffect(() => {
    if (!isStartup && !isMentor) return;

    let active = true;

    const fetchSearchResults = async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

        // Startup prebaruva mentori, mentor prebaruva startup kompanii
        const endpoint = isStartup ? "/mentors" : "/startups";

        const response = await api.get(endpoint);

        if (!active) return;

        setSearchResults(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (error) {
        if (!active) return;

        console.error("Search data loading failed:", error);

        setSearchError(
          isStartup
            ? "Failed to load mentors."
            : "Failed to load startups."
        );
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    };

    fetchSearchResults();

    return () => {
      active = false;
    };
  }, [isStartup, isMentor]);

  // Zatvoranje na dropdown pri klik nadvor
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Ime na mentor ili startup kompanija
  const getResultName = (result) => {
    if (isStartup) {
      return (
        [result.firstName, result.lastName]
          .filter(Boolean)
          .join(" ") ||
        result.email ||
        "Mentor"
      );
    }

    return result.startupName || "Startup";
  };

  // Filtriranje spored vneseniot tekst
  const filteredResults = searchResults.filter((result) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return false;

    const name = getResultName(result).toLowerCase();

    if (isStartup) {
      return (
        name.includes(query) ||
        (result.email || "").toLowerCase().includes(query)
      );
    }

    return name.includes(query);
  });

  // Izbor na rezultat
  const handleResultSelect = (result) => {
    setSearchQuery("");
    setSearchOpen(false);

    if (isStartup) {
      // Postoecka ruta za mentor profil
      navigate(`/startup/mentors/${result._id}`);
    } else {
      // Zasega go prikazuvame imeto na izbranata kompanija.
      // Navigacija ke dodademe koga ke ja potvrdime rutata.
      setSearchQuery(getResultName(result));
    }
  };

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

      const response = await api.patch(
        "/auth/profile-picture",
        formData
      );

      const updatedUser = {
        ...user,
        profilePicture: response.data.profilePicture,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);
    } catch (error) {
      console.error("Profile picture upload failed:", error);

      setUploadError(
        error.response?.data?.message ||
          "Failed to update profile picture."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <header className="dashboard-header">
      {/* SEARCH */}
      <div
        className="dashboard-search-container"
        ref={searchRef}
      >
        <div className="dashboard-search">
          <span className="dashboard-search-icon">
            <Search size={19} strokeWidth={1.8} />
          </span>

          <input
            type="text"
            placeholder={
              isStartup
                ? "Search Mentor..."
                : "Search Startup..."
            }
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) {
                setSearchOpen(true);
              }
            }}
          />
        </div>

        {/* SEARCH RESULTS */}
        {searchOpen && searchQuery.trim() && (
          <div className="dashboard-search-dropdown">
            {searchLoading ? (
              <p className="dashboard-search-message">
                Loading...
              </p>
            ) : searchError ? (
              <p className="dashboard-search-message">
                {searchError}
              </p>
            ) : filteredResults.length === 0 ? (
              <p className="dashboard-search-message">
                {isStartup
                  ? "No mentors found."
                  : "No startups found."}
              </p>
            ) : (
              filteredResults.slice(0, 6).map((result) => {
                const resultName = getResultName(result);

                const pictureUrl = getProfilePictureUrl(
                  result.profilePicture
                );

                return (
                  <button
                    key={result._id}
                    type="button"
                    className="dashboard-search-result"
                    onClick={() =>
                      handleResultSelect(result)
                    }
                  >
                    <span className="dashboard-search-result-avatar">
                      {pictureUrl ? (
                        <img
                          src={pictureUrl}
                          alt={resultName}
                        />
                      ) : (
                        resultName.charAt(0).toUpperCase()
                      )}
                    </span>

                    <span className="dashboard-search-result-info">
                      <strong>{resultName}</strong>

                      {isStartup && result.email && (
                        <small>{result.email}</small>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* USER PROFILE */}
      <div className="dashboard-user">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleProfilePictureChange}
          style={{ display: "none" }}
        />

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
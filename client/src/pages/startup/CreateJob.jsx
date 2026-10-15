import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./CreateJob.css";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillsRequired: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  // Create a new job
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = {};

    // Validate job title
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required.";
    }

    // Validate job description
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required.";
    }

    // Convert skills string into an array
    const skills = formData.skillsRequired
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    // Validate required skills
    if (skills.length === 0) {
      newErrors.skillsRequired = "At least one skill is required.";
    }

    // Stop submission if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for the backend
    const newJob = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      skillsRequired: skills,
    };

    try {
      setLoading(true);
      setServerError("");

      // Send job data to the backend
      const response = await api.post("/jobs", newJob);

      console.log("Job created successfully:", response.data);

      // Redirect to Startup Jobs after successful creation
      navigate("/startup/jobs", { replace: true });
    } catch (error) {
      console.error(
        "Create job failed:",
        error.response?.data || error.message
      );

      setServerError(
        error.response?.data?.message ||
          "Failed to create job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page">
      <div className="create-job-header">
        <div>
          <h1>Create New Job</h1>
          <p>
            Create a new opportunity for mentors to apply.
          </p>
        </div>

        <button
          type="button"
          className="create-job-back"
          onClick={() => navigate("/startup/jobs")}
        >
          Back to Jobs
        </button>
      </div>

      <form
        className="create-job-form"
        onSubmit={handleSubmit}
      >
        {/* JOB TITLE */}
        <div className="create-job-field">
          <label htmlFor="title">Job Title</label>

          <input
            id="title"
            type="text"
            name="title"
            placeholder="e.g. Improve Customer Retention"
            value={formData.title}
            onChange={handleChange}
          />

          {errors.title && (
            <span className="create-job-error">
              {errors.title}
            </span>
          )}
        </div>

        {/* JOB DESCRIPTION */}
        <div className="create-job-field">
          <label htmlFor="description">
            Job Description
          </label>

          <textarea
            id="description"
            name="description"
            rows="6"
            placeholder="Describe the goals and responsibilities of this job..."
            value={formData.description}
            onChange={handleChange}
          />

          {errors.description && (
            <span className="create-job-error">
              {errors.description}
            </span>
          )}
        </div>

        {/* REQUIRED SKILLS */}
        <div className="create-job-field">
          <label htmlFor="skillsRequired">
            Required Skills
          </label>

          <input
            id="skillsRequired"
            type="text"
            name="skillsRequired"
            placeholder="e.g. Marketing, Strategy, Analytics"
            value={formData.skillsRequired}
            onChange={handleChange}
          />

          <small>
            Separate multiple skills with commas.
          </small>

          {errors.skillsRequired && (
            <span className="create-job-error">
              {errors.skillsRequired}
            </span>
          )}
        </div>

        {/* JOB TYPE */}
        <div className="create-job-field">
          <label>Job Type</label>

          <div className="create-job-type">
            <span className="create-job-type-badge">
              Open Job
            </span>

            <p>
              This job will be available for mentors to apply.
            </p>
          </div>
        </div>

        {/* SERVER ERROR */}
        {serverError && (
          <p className="create-job-error" role="alert">
            {serverError}
          </p>
        )}

        {/* ACTION BUTTONS */}
        <div className="create-job-actions">
          <button
            type="button"
            className="create-job-cancel"
            onClick={() => navigate("/startup/jobs")}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-job-submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateJob;
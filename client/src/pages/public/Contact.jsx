import { useState } from "react";

import api from "../../api/axios";

import "./Contact.css";
import contactBackground from "../../assets/Images/About/About1.svg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Azuriranje na podatocite pri vnesuvanje
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Isprakjanje na porakata do backendot
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await api.post("/contact", formData);

      setSuccess(
        response.data.message ||
          "Your message has been sent successfully!"
      );

      // Gi praznime polinjata po uspeshno isprakjanje
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="contact-section"
      style={{ backgroundImage: `url(${contactBackground})` }}
    >
      <div className="contact-container">
        <h1>Let’s Talk!</h1>

        <p className="contact-description">
          We’re thrilled to connect with you! Whether you have a question,
          need assistance, or want to discuss a potential project, we’re
          here to listen and help. At Mentor Token, we believe in the power
          of collaboration and are committed to providing you with the best
          support and solutions. Fill out the form below, and one of our team
          members will get back to you as soon as possible.
          <br />
          Let’s create something amazing together!
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-input-row">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              maxLength={254}
              required
            />
          </div>

          <textarea
            name="message"
            placeholder="Your message"
            rows="6"
            value={formData.message}
            onChange={handleChange}
            maxLength={5000}
            required
          />

          {/* Poraka pri uspeshno isprakjanje */}
          {success && (
            <p role="status" style={{ color: "#28a745" }}>
              {success}
            </p>
          )}

          {/* Poraka pri greshka */}
          {error && (
            <p role="alert" style={{ color: "#dc3545" }}>
              {error}
            </p>
          )}

          <div className="contact-submit-wrapper">
            <button
              type="submit"
              className="contact-submit-button"
              disabled={loading}
            >
              {loading ? "SENDING..." : "SEND MESSAGE"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
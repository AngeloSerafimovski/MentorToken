import "./About.css";

import aboutBackground from "../../assets/Images/About/About1.svg";
import teamMembers from "../../assets/Images/About/About2.svg";

const About = () => {
  return (
    <main className="about-page">
      <section
        className="about-hero"
        style={{ backgroundImage: `url(${aboutBackground})` }}
      >
        <div className="about-hero-content">
          <h1>Meet our team members</h1>

          <p>
            We Focus on the details of everything we do. All to help businesses
            around the world
            <br />
            Focus on what's most important to them.
          </p>

          <a href="/contact" className="about-contact-button">
            <span className="about-button-arrow">→</span>
            <span>Get in touch</span>
          </a>
        </div>
      </section>

      <section className="about-team">
        <img
          src={teamMembers}
          alt="Mentor Token team members"
          className="about-team-image"
        />
      </section>
    </main>
  );
};

export default About;
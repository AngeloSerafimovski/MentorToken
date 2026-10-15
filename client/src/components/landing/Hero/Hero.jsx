import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import background from "../../../assets/Images/background.png";
import laptop from "../../../assets/Images/laptop.svg";

import "./Hero.css";

function Hero() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="hero-left">
        <h1>
          Grow your StartUp!
          <br />
          Monitoring and
          <br />
          Evaluating now is easy!
        </h1>

        <p>
          Welcome to Mentor Token, where we redefine the dynamics of
          startup success. Our innovative platform offers a transformative
          approach to mentorship, ensuring that mentors are not just
          engaged but motivated to drive the success of the ventures they
          support.
        </p>

        <div className="hero-buttons">
          <Link to="/register" className="primary-btn">
            <ArrowRight size={17} strokeWidth={2} />
            <span>Get Started!</span>
          </Link>

          <Link to="/contact" className="secondary-btn">
            Get in touch
          </Link>
        </div>
      </div>

      <div className="hero-right">
        <img
          src={laptop}
          alt="Mentor Token dashboard laptop"
          className="hero-laptop"
        />
      </div>
    </section>
  );
}

export default Hero;
import "./Footer.css";
import mentorTokenIcon from "../../../assets/icons/Vector.svg";




const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-content">

          <div className="footer-brand">
            <div className="footer-logo">
  <img
    src={mentorTokenIcon}
    alt=""
    className="footer-logo-icon"
  />
  <span>Mentor Token</span>
</div>

            <p>
              With Mentor Token, every failure
              <br />
              transforms into an opportunity for
              <br />
              growth.
            </p>
          </div>

          <div className="footer-column">
            <h4>Pages</h4>
            <a href="/">Home</a>
            <a href="/contact">Contact US</a>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <a href="mailto:info@mentortoken.com">
              info@mentortoken.com
            </a>
            <a href="tel:+389123456789">
              +(389) 123 456 789
            </a>
          </div>

          <div className="footer-column footer-social">
            <h4>Follow Us</h4>

            <div className="social-icons">
              <a href="#" aria-label="LinkedIn">
                in
              </a>

              <a href="#" aria-label="Twitter">
                ♥
              </a>

              <a href="#" aria-label="Facebook">
                f
              </a>
            </div>
          </div>

        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          ©2024 Mentor Token. &nbsp; All right reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
import logo from "../../../assets/Icons/Vector.svg";

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-icon">
          <img src={logo} alt="Mentor Token Logo" />
        </span>

        <span>Mentor Token</span>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <div className="header-actions">
        <Link to="/login" className="login-link">
          Login
        </Link>

        <Link to="/register" className="get-started-btn">
          <ArrowRight size={17} strokeWidth={2} />
          <span>Get Started</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
import background from "../../../assets/Images/Auth/LoginBackground1.svg";
import rocket from "../../../assets/Images/Auth/LoginRocket.svg";
import logoIcon from "../../../assets/Images/Auth/LoginMentor.svg";
import "./AuthSidebar.css";

function AuthSidebar() {
  return (
    <div
      className="auth-sidebar"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="auth-sidebar-heading">
        <h1>
          GROW
          <br />
          YOUR
          <br />
          STARTUP!
        </h1>

        <p>MONITORING AND EVALUATING NOW IS EASY!</p>
      </div>

      <img
        src={rocket}
        alt=""
        className="auth-sidebar-rocket"
      />

      <div className="auth-sidebar-brand">
        <div className="auth-sidebar-logo">
          <img src={logoIcon} alt="" />
          <span>Mentor Token</span>
        </div>

        <span className="auth-sidebar-website">
          mentortoken.com
        </span>
      </div>
    </div>
  );
}

export default AuthSidebar;
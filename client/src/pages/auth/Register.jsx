import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import logoIcon from "../../assets/Icons/Vector.svg";

function Register() {

    /* React hookovi*/
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState("startup");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");

    /* validacii*/
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

    /* funkcii/event handleri*/
    const isPasswordValid =
  hasMinLength &&
  hasUppercase &&
  hasLowercase &&
  hasNumber &&
  hasSpecialCharacter;

const isEmailValid =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isFormValid = isEmailValid && isPasswordValid;

 const handleContinue = () => {
  if (!isFormValid) return;

  const registrationData = {
    email,
    password,
    accountType,
  };

  if (accountType === "startup") {
    navigate("/register/startup", {
      state: registrationData,
    });
  } else if (accountType === "mentor") {
    navigate("/register/mentor", {
      state: registrationData,
    });
  }
};

  return (
    <div className="register-page">
      <div className="register-form-container">

        <div className="register-logo">
          <img src={logoIcon} alt="Mentor Token" />
        </div>

        <h1>CHOOSE ACCOUNT TYPE</h1>

        <div className="account-type-selector">
  <button
    type="button"
    className={`account-type ${accountType === "startup" ? "active" : ""}`}
    onClick={() => setAccountType("startup")}
  >
    Startup
  </button>

  <button
    type="button"
    className={`account-type ${accountType === "mentor" ? "active" : ""}`}
    onClick={() => setAccountType("mentor")}
  >
    Mentor
  </button>
</div>
      <div className="register-fields">
          <div className="register-field">
            <label htmlFor="email">Email</label>
            <input
  id="email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
          </div>

          <div className="register-field">

            <label htmlFor="password">Password</label>
           <div className="password-input-wrapper">
  <input
    id="password"
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  {password.length > 0 && (
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? "Hide" : "View"}
    </button>
  )}
</div>


<div className="password-requirements">
  <p>Password must contain:</p>

  <span className={hasMinLength ? "valid" : ""}>
    {hasMinLength ? "✓" : "•"} At least 8 characters
  </span>

  <span className={hasUppercase ? "valid" : ""}>
    {hasUppercase ? "✓" : "•"} One uppercase letter
  </span>

  <span className={hasLowercase ? "valid" : ""}>
    {hasLowercase ? "✓" : "•"} One lowercase letter
  </span>

  <span className={hasNumber ? "valid" : ""}>
    {hasNumber ? "✓" : "•"} One number
  </span>

  <span className={hasSpecialCharacter ? "valid" : ""}>
    {hasSpecialCharacter ? "✓" : "•"} One special character
  </span>
</div>
          </div>
          <button
  type="button"
  className="continue-button"
  disabled={!isFormValid}
  onClick={handleContinue}
>
  Continue
</button>

<p className="login-link">
  Already have an account? <Link to="/login">Log in.</Link>
</p>
        </div>

      </div>
      



    </div>
    
  );
}

export default Register;
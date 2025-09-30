// src/components/LoginPD.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FiAlertCircle } from "react-icons/fi";
import "../styles.css";
import { authPdKaiia } from "../firebase";

const LoginPD = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const allowedEmails = [
    "developments@high5clothing.co.uk",
    "sales@high5clothing.co.uk"
    // Add more PD/KAIIA authorized emails here
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.toLowerCase().trim();
    if (!allowedEmails.includes(normalizedEmail)) {
      setError("Access denied: Email not authorized for PD & KAIIA dashboard");
      return;
    }

    try {
      await signInWithEmailAndPassword(authPdKaiia, email, "High54ever");
      const redirectTo = location.state?.from?.pathname || "/pd-kaiia";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("PD Login error:", err);
      setError(
        `Login failed: ${
          err.code === "auth/wrong-password" ? "Invalid credentials" : err.message
        }`
      );
    }
  };

  return (
    <div
      className="app-container light"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div className="login-container">
        <h2 className="login-title">PD & KAIIA Dashboard Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
              placeholder="Enter your email"
            />
          </div>
          {error && (
            <div className="error-content">
              <FiAlertCircle size={20} className="error-icon" />
              <p>{error}</p>
            </div>
          )}
          <button type="submit" className="action-button login-button">
            Login to PD & KAIIA
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPD;
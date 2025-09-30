// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FiAlertCircle } from "react-icons/fi";
import "../styles.css";
import { authHigh5 } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const allowedEmails = [
    "sales@high5clothing.co.uk",
    "developments@high5clothing.co.uk"
    // Add HIGH5 dashboard users here
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.toLowerCase().trim();
    if (!allowedEmails.includes(normalizedEmail)) {
      setError("Access denied: Email not authorized for HIGH5 dashboard");
      return;
    }

    try {
      await signInWithEmailAndPassword(authHigh5, email, "High54ever");
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
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
        <h2 className="login-title">High5 Dashboard Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="login-input"
            />
          </div>
          {error && (
            <div className="error-content">
              <FiAlertCircle size={20} className="error-icon" />
              <p>{error}</p>
            </div>
          )}
          <button type="submit" className="action-button login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
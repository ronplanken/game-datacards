/**
 * SignupModal Component
 *
 * Modal dialog for user registration matching the wizard aesthetic.
 * Features email/password signup, OAuth providers, and terms acceptance.
 */

import React, { useState, useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { Mail, Lock, User, X, Eye, EyeOff, AlertCircle, Check, ArrowRight } from "lucide-react";
import { useAuth } from "../../Hooks/useAuth";
import "./AuthModals.css";

// Google icon component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// GitHub icon component
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const modalRoot = document.getElementById("modal-root");

// Password strength checker
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Weak", color: "#ef4444" },
    { score: 2, label: "Fair", color: "#f59e0b" },
    { score: 3, label: "Good", color: "#eab308" },
    { score: 4, label: "Strong", color: "#22c55e" },
    { score: 5, label: "Excellent", color: "#10b981" },
  ];

  return levels[Math.min(score, 5)];
};

export const SignupModal = ({ visible, onCancel, onSwitchToLogin, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isExiting, setIsExiting] = useState(false);

  const { signUp, signInWithOAuth } = useAuth();

  const passwordStrength = getPasswordStrength(password);

  // Handle ESC key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && visible) {
        handleClose();
      }
    },
    [visible]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAcceptTerms(false);
      setErrors({});
      setIsExiting(false);
    }
  }, [visible]);

  /**
   * Close with exit animation
   */
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      if (onCancel) onCancel();
    }, 200);
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle email/password signup
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { success } = await signUp(email, password, {
        display_name: name,
      });

      if (success) {
        handleClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OAuth signup
   */
  const handleOAuthSignup = async (provider) => {
    setLoading(true);
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error("OAuth signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle overlay click
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className={`auth-overlay ${isExiting ? "auth-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div className="auth-modal auth-modal--signup" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="auth-header">
          <button className="auth-close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
          <div className="auth-header-content">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Create your free account</p>
          </div>
        </header>

        {/* Body */}
        <div className="auth-body">
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Name field */}
            <div className="auth-form-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={18} />
                <input
                  type="text"
                  className={`auth-input ${errors.name ? "auth-input--error" : ""}`}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  autoFocus
                />
              </div>
              {errors.name && (
                <div className="auth-error-msg">
                  <AlertCircle size={14} />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email field */}
            <div className="auth-form-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={18} />
                <input
                  type="email"
                  className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="auth-error-msg">
                  <AlertCircle size={14} />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password field */}
            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: "46px" }}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "8px",
                    fontSize: "12px",
                  }}>
                  <div
                    style={{
                      flex: 1,
                      height: "3px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}>
                    <div
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        height: "100%",
                        background: passwordStrength.color,
                        transition: "all 0.3s",
                      }}
                    />
                  </div>
                  <span style={{ color: passwordStrength.color, fontWeight: 500 }}>{passwordStrength.label}</span>
                </div>
              )}
              {errors.password && (
                <div className="auth-error-msg">
                  <AlertCircle size={14} />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="auth-form-group">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`auth-input ${errors.confirmPassword ? "auth-input--error" : ""}`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: "46px" }}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <Check
                    size={18}
                    style={{
                      position: "absolute",
                      right: "46px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#22c55e",
                    }}
                  />
                )}
              </div>
              {errors.confirmPassword && (
                <div className="auth-error-msg">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="auth-form-group">
              <label className="auth-checkbox-wrapper">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span className="auth-checkbox-label">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && (
                <div className="auth-error-msg" style={{ marginTop: "8px" }}>
                  <AlertCircle size={14} />
                  {errors.terms}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`auth-btn auth-btn--primary ${loading ? "auth-btn--loading" : ""}`}
              disabled={loading}
              style={{ marginTop: "8px" }}>
              {loading ? (
                <div className="auth-btn-spinner" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="auth-btn-arrow" size={18} />
                </>
              )}
            </button>

            <div className="auth-divider">
              <span className="auth-divider-text">Or continue with</span>
            </div>

            <div className="auth-oauth-grid">
              <button
                type="button"
                className="auth-btn auth-btn--oauth auth-btn--google"
                onClick={() => handleOAuthSignup("google")}
                disabled={loading}>
                <GoogleIcon />
                Google
              </button>

              <button
                type="button"
                className="auth-btn auth-btn--oauth auth-btn--github"
                onClick={() => handleOAuthSignup("github")}
                disabled={loading}>
                <GitHubIcon />
                GitHub
              </button>
            </div>

            <div className="auth-footer">
              <span className="auth-footer-text">
                Already have an account?{" "}
                <button type="button" className="auth-footer-link" onClick={onSwitchToLogin}>
                  Sign in
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default SignupModal;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, AlertCircle, Check } from "lucide-react";
import { useAuth } from "../../../../Hooks/useAuth";
import logo from "../../../../Images/logo.png";
import "./MobileAuth.css";

export const MobilePasswordResetPage = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(email, {
        redirectTo: `${window.location.origin}/mobile/login`,
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="mobile-auth">
        <div className="mobile-auth-content">
          <div className="mobile-auth-success">
            <div className="mobile-auth-success-icon">
              <Mail size={40} />
            </div>
            <h2 className="mobile-auth-success-title">Check Your Email</h2>
            <p className="mobile-auth-success-text">
              We&apos;ve sent password reset instructions to <strong>{email}</strong>. Click the link in the email to
              create a new password.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" }}>
            <button type="button" className="mobile-auth-button" onClick={() => navigate("/mobile/login")}>
              Return to Sign In
            </button>
            <button
              type="button"
              className="mobile-auth-button mobile-auth-button--ghost"
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}>
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-auth">
      <div className="mobile-auth-content">
        {/* Header */}
        <div className="mobile-auth-header">
          <button className="mobile-auth-back" onClick={() => navigate(-1)} type="button" aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Branding */}
        <div className="mobile-auth-branding mobile-auth-fade-in">
          <img src={logo} alt="Game Datacards" className="mobile-auth-logo" />
          <h1 className="mobile-auth-title">Reset Password</h1>
          <p className="mobile-auth-subtitle">Enter your email and we&apos;ll send you a link to reset your password</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mobile-auth-alert mobile-auth-alert--error mobile-auth-fade-in">
            <AlertCircle size={18} className="mobile-auth-alert-icon" />
            <p className="mobile-auth-alert-text">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="mobile-auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mobile-auth-field mobile-auth-fade-in">
            <label className="mobile-auth-label" htmlFor="email">
              Email Address
            </label>
            <div className="mobile-auth-input-wrapper">
              <input
                id="email"
                type="email"
                className={`mobile-auth-input ${error && !email ? "mobile-auth-input--error" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
                disabled={loading}
              />
              <Mail size={20} className="mobile-auth-input-icon" />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="mobile-auth-button mobile-auth-fade-in" disabled={loading}>
            {loading ? <span className="mobile-auth-spinner" /> : "Send Reset Link"}
          </button>
        </form>

        {/* Footer */}
        <div className="mobile-auth-footer mobile-auth-fade-in">
          <p className="mobile-auth-footer-text">
            Remember your password?{" "}
            <button type="button" className="mobile-auth-text-link" onClick={() => navigate("/mobile/login")}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

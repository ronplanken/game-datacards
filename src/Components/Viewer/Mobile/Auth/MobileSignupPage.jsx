import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, AlertCircle, Check } from "lucide-react";
import { useAuth } from "../../../../Hooks/useAuth";
import logo from "../../../../Images/logo.png";
import "./MobileAuth.css";

// Password strength calculator
const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  if (checks.length) score++;
  if (checks.lowercase && checks.uppercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;
  if (password.length >= 12) score++;

  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  return { score, label: labels[score], checks };
};

export const MobileSignupPage = () => {
  const navigate = useNavigate();
  const { signUp, signInWithOAuth } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (passwordStrength.score < 2) {
      setError("Please choose a stronger password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password, {
        display_name: name.trim(),
      });

      if (signUpError) {
        if (signUpError.message?.includes("already registered")) {
          setError("An account with this email already exists");
        } else {
          setError(signUpError.message || "Failed to create account");
        }
        setLoading(false);
        return;
      }

      // Success - show confirmation message
      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError("");
    setOauthLoading(provider);

    try {
      const { error: oauthError } = await signInWithOAuth(provider, {
        redirectTo: `${window.location.origin}/mobile`,
      });

      if (oauthError) {
        setError(oauthError.message || `Failed to sign up with ${provider}`);
        setOauthLoading(null);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setOauthLoading(null);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="mobile-auth">
        <div className="mobile-auth-content">
          <div className="mobile-auth-success">
            <div className="mobile-auth-success-icon">
              <Check size={40} />
            </div>
            <h2 className="mobile-auth-success-title">Check Your Email</h2>
            <p className="mobile-auth-success-text">
              We&apos;ve sent a verification link to <strong>{email}</strong>. Please check your inbox and click the
              link to activate your account.
            </p>
          </div>

          <div className="mobile-auth-footer">
            <button
              type="button"
              className="mobile-auth-button mobile-auth-button--secondary"
              onClick={() => navigate("/mobile/login")}>
              Return to Sign In
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
          <h1 className="mobile-auth-title">Create Account</h1>
          <p className="mobile-auth-subtitle">Join the community and sync your cards</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mobile-auth-alert mobile-auth-alert--error mobile-auth-fade-in">
            <AlertCircle size={18} className="mobile-auth-alert-icon" />
            <p className="mobile-auth-alert-text">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="mobile-auth-form mobile-auth-stagger" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mobile-auth-field mobile-auth-fade-in">
            <label className="mobile-auth-label" htmlFor="name">
              Display Name
            </label>
            <div className="mobile-auth-input-wrapper">
              <input
                id="name"
                type="text"
                className="mobile-auth-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                autoCapitalize="words"
                disabled={loading}
              />
              <User size={20} className="mobile-auth-input-icon" />
            </div>
          </div>

          {/* Email */}
          <div className="mobile-auth-field mobile-auth-fade-in">
            <label className="mobile-auth-label" htmlFor="email">
              Email
            </label>
            <div className="mobile-auth-input-wrapper">
              <input
                id="email"
                type="email"
                className="mobile-auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={loading}
              />
              <Mail size={20} className="mobile-auth-input-icon" />
            </div>
          </div>

          {/* Password */}
          <div className="mobile-auth-field mobile-auth-fade-in">
            <label className="mobile-auth-label" htmlFor="password">
              Password
            </label>
            <div className="mobile-auth-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="mobile-auth-input mobile-auth-input--has-toggle"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <Lock size={20} className="mobile-auth-input-icon" />
              <button
                type="button"
                className="mobile-auth-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength */}
            {password && (
              <div className="mobile-auth-strength" data-strength={passwordStrength.score}>
                <div className="mobile-auth-strength-bars">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`mobile-auth-strength-bar ${
                        level <= passwordStrength.score ? "mobile-auth-strength-bar--active" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="mobile-auth-strength-text">{passwordStrength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mobile-auth-field mobile-auth-fade-in">
            <label className="mobile-auth-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="mobile-auth-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`mobile-auth-input mobile-auth-input--has-toggle ${
                  confirmPassword && password !== confirmPassword ? "mobile-auth-input--error" : ""
                }`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <Lock size={20} className="mobile-auth-input-icon" />
              <button
                type="button"
                className="mobile-auth-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div className="mobile-auth-error">
                <AlertCircle size={14} />
                <span>Passwords do not match</span>
              </div>
            )}
          </div>

          {/* Terms */}
          <label className="mobile-auth-checkbox mobile-auth-fade-in">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={loading}
            />
            <span className="mobile-auth-checkbox-box">
              <Check size={14} />
            </span>
            <span className="mobile-auth-checkbox-label">
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="mobile-auth-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="mobile-auth-link">
                Privacy Policy
              </a>
            </span>
          </label>

          {/* Submit */}
          <button type="submit" className="mobile-auth-button mobile-auth-fade-in" disabled={loading || oauthLoading}>
            {loading ? <span className="mobile-auth-spinner" /> : "Create Account"}
          </button>

          {/* Divider */}
          <div className="mobile-auth-divider mobile-auth-fade-in">
            <span className="mobile-auth-divider-text">or continue with</span>
          </div>

          {/* OAuth */}
          <div className="mobile-auth-oauth mobile-auth-fade-in">
            <button
              type="button"
              className="mobile-auth-oauth-button"
              onClick={() => handleOAuth("google")}
              disabled={loading || oauthLoading}>
              {oauthLoading === "google" ? (
                <span
                  className="mobile-auth-spinner"
                  style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#333" }}
                />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
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
                  Continue with Google
                </>
              )}
            </button>

            <button
              type="button"
              className="mobile-auth-oauth-button"
              onClick={() => handleOAuth("github")}
              disabled={loading || oauthLoading}>
              {oauthLoading === "github" ? (
                <span
                  className="mobile-auth-spinner"
                  style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#333" }}
                />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mobile-auth-footer mobile-auth-fade-in">
          <p className="mobile-auth-footer-text">
            Already have an account?{" "}
            <button type="button" className="mobile-auth-text-link" onClick={() => navigate("/mobile/login")}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

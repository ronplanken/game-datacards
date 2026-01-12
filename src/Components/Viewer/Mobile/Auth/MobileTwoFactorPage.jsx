import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Shield, AlertCircle } from "lucide-react";
import { useAuth } from "../../../../Hooks/useAuth";
import logo from "../../../../Images/logo.png";
import "./MobileAuth.css";

export const MobileTwoFactorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verify2FA } = useAuth();

  // Get challenge data from navigation state
  const { factorId, challengeId, from } = location.state || {};

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // Redirect if no challenge data
  useEffect(() => {
    if (!factorId || !challengeId) {
      navigate("/mobile/login", { replace: true });
    }
  }, [factorId, challengeId, navigate]);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (code[index]) {
        // Clear current digit
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus();
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
      }
      e.preventDefault();
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      setError("");

      // Focus appropriate input
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();

      // Auto-submit if complete
      if (pastedData.length === 6) {
        handleVerify(pastedData);
      }
    }
  };

  const handleVerify = async (verifyCode) => {
    if (!factorId || !challengeId) return;

    setLoading(true);
    setError("");

    try {
      const { error: verifyError } = await verify2FA(factorId, challengeId, verifyCode);

      if (verifyError) {
        setError("Invalid verification code. Please try again.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // Success - navigate to destination
      navigate(from || "/mobile", { replace: true });
    } catch (err) {
      setError("Verification failed. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    handleVerify(fullCode);
  };

  if (!factorId || !challengeId) {
    return null;
  }

  return (
    <div className="mobile-auth">
      <div className="mobile-auth-content">
        {/* Header */}
        <div className="mobile-auth-header">
          <button
            className="mobile-auth-back"
            onClick={() => navigate("/mobile/login", { replace: true })}
            type="button"
            aria-label="Go back to login">
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Branding */}
        <div className="mobile-auth-branding mobile-auth-fade-in">
          <div
            className="mobile-auth-success-icon"
            style={{ background: "rgba(22, 119, 255, 0.15)", marginBottom: "16px" }}>
            <Shield size={40} style={{ color: "#1677ff" }} />
          </div>
          <h1 className="mobile-auth-title">Two-Factor Authentication</h1>
          <p className="mobile-auth-subtitle">Enter the 6-digit code from your authenticator app</p>
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
          {/* Code Input */}
          <div className="mobile-auth-code-input mobile-auth-fade-in" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className={`mobile-auth-code-digit ${digit ? "mobile-auth-code-digit--filled" : ""}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                autoComplete="one-time-code"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mobile-auth-button mobile-auth-fade-in"
            disabled={loading || code.join("").length !== 6}>
            {loading ? <span className="mobile-auth-spinner" /> : "Verify"}
          </button>

          {/* Help text */}
          <p className="mobile-auth-hint mobile-auth-fade-in" style={{ textAlign: "center", marginTop: "16px" }}>
            Open your authenticator app (like Google Authenticator or Authy) and enter the 6-digit code shown for Game
            Datacards
          </p>
        </form>

        {/* Footer */}
        <div className="mobile-auth-footer mobile-auth-fade-in">
          <p className="mobile-auth-footer-text">
            Lost access to your authenticator?{" "}
            <a href="mailto:support@gamedatacards.com" className="mobile-auth-link">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

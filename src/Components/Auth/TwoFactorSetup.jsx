/**
 * TwoFactorSetup Component
 *
 * Premium modal for setting up Two-Factor Authentication (2FA):
 * - Displays QR code for scanning with authenticator app
 * - Shows secret key as backup
 * - Verifies setup with test code
 * - Lists authenticator app recommendations
 * - Provides unenroll option for existing 2FA
 *
 * Dark navy theme with gold accents matching UpgradeModal aesthetic.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import * as ReactDOM from "react-dom";
import { Shield, X, Key, CheckCircle, AlertTriangle, Copy, Info, Smartphone, Monitor, Globe } from "lucide-react";
import { useAuth } from "../../Hooks/useAuth";
import "./TwoFactorSetup.css";

const modalRoot = document.getElementById("modal-root");

// Authenticator app recommendations with platform icons
const authenticatorApps = [
  { name: "Authy", platforms: ["mobile", "desktop"] },
  { name: "Google Authenticator", platforms: ["mobile"] },
  { name: "1Password", platforms: ["mobile", "desktop"] },
];

// Platform icon mapping
const PlatformIcons = ({ platforms }) => (
  <div className="tfa-app-platforms">
    {platforms.includes("mobile") && <Smartphone size={12} />}
    {platforms.includes("desktop") && <Monitor size={12} />}
    {platforms.includes("all") && <Globe size={12} />}
  </div>
);

export const TwoFactorSetup = ({ visible, onCancel, onSuccess }) => {
  const { enroll2FA, verify2FAEnrollment, getFactors, unenroll2FA } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [existingFactors, setExistingFactors] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);

  const codeInputRef = useRef(null);

  /**
   * Handle ESC key
   */
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

  /**
   * Load existing factors on mount
   */
  useEffect(() => {
    if (visible) {
      loadFactors();
      setIsExiting(false);
      setError(null);
      setVerificationCode("");
      setCopySuccess(false);
    }
  }, [visible]);

  /**
   * Focus code input when on step 1
   */
  useEffect(() => {
    if (currentStep === 1 && codeInputRef.current) {
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  }, [currentStep]);

  /**
   * Load user's existing 2FA factors
   */
  const loadFactors = async () => {
    const result = await getFactors();
    if (result.success) {
      setExistingFactors(result.totpFactors || []);
      if (result.totpFactors && result.totpFactors.length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(0);
      }
    }
  };

  /**
   * Close with exit animation
   */
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setCurrentStep(0);
      setEnrollmentData(null);
      setVerificationCode("");
      setError(null);
      if (onCancel) onCancel();
    }, 200);
  };

  /**
   * Handle overlay click
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  /**
   * Start 2FA enrollment process
   */
  const handleStartEnrollment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await enroll2FA();
      if (result.success) {
        setEnrollmentData(result);
        setCurrentStep(1);
      } else {
        setError(result.error || "Failed to start enrollment");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify the setup with code from authenticator
   */
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await verify2FAEnrollment(enrollmentData.factorId, verificationCode);
      if (result.success) {
        setCurrentStep(2);
        setVerificationCode("");
        if (onSuccess) onSuccess();
        await loadFactors();
      } else {
        setError(result.error || "Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disable 2FA
   */
  const handleDisable2FA = async (factorId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await unenroll2FA(factorId);
      if (result.success) {
        await loadFactors();
        setCurrentStep(0);
        setEnrollmentData(null);
      } else {
        setError(result.error || "Failed to disable 2FA");
      }
    } catch (err) {
      console.error("Unenroll error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy secret to clipboard
   */
  const handleCopySecret = async () => {
    if (enrollmentData?.secret) {
      try {
        await navigator.clipboard.writeText(enrollmentData.secret);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  /**
   * Handle verification code input
   */
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    setError(null);
  };

  /**
   * Get step indicator state
   */
  const getStepState = (stepIndex) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "active";
    return "pending";
  };

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className={`tfa-overlay ${isExiting ? "tfa-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div className="tfa-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="tfa-header">
          <button className="tfa-close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>

          <div className={`tfa-shield ${currentStep === 2 ? "tfa-shield--success" : ""}`}>
            {currentStep === 2 ? <CheckCircle size={26} /> : <Shield size={26} />}
          </div>

          <h1 className="tfa-title">
            {currentStep === 0 && "Two-Factor Authentication"}
            {currentStep === 1 && "Set Up Authenticator"}
            {currentStep === 2 && "2FA Enabled"}
          </h1>
        </header>

        {/* Step indicator */}
        <div className="tfa-steps">
          {[0, 1, 2].map((step) => (
            <div key={step} className={`tfa-step-dot tfa-step-dot--${getStepState(step)}`} />
          ))}
        </div>

        {/* Body */}
        <div className="tfa-body">
          {/* Error display */}
          {error && (
            <div className="tfa-alert tfa-alert--warning">
              <AlertTriangle className="tfa-alert-icon" size={18} />
              <div className="tfa-alert-content">
                <p className="tfa-alert-text">{error}</p>
              </div>
            </div>
          )}

          {/* Step 0: Introduction */}
          {currentStep === 0 && (
            <div className="tfa-step-content">
              <div className="tfa-alert tfa-alert--info">
                <Info className="tfa-alert-icon" size={18} />
                <div className="tfa-alert-content">
                  <p className="tfa-alert-title">Enhance Your Security</p>
                  <p className="tfa-alert-text">
                    Two-factor authentication requires a code from your phone when signing in.
                  </p>
                </div>
              </div>

              <h3 className="tfa-section-title">
                <Smartphone size={16} />
                How it works
              </h3>
              <ol className="tfa-steps-list">
                <li>Install an authenticator app on your phone</li>
                <li>Scan the QR code we provide</li>
                <li>Enter the 6-digit code to verify</li>
                <li>Use codes from your app when signing in</li>
              </ol>

              <h3 className="tfa-section-title">Recommended Apps</h3>
              <div className="tfa-apps-grid">
                {authenticatorApps.map((app) => (
                  <div key={app.name} className="tfa-app-item">
                    <p className="tfa-app-name">{app.name}</p>
                    <PlatformIcons platforms={app.platforms} />
                  </div>
                ))}
              </div>

              <button className="tfa-btn tfa-btn--primary" onClick={handleStartEnrollment} disabled={loading}>
                {loading ? <div className="tfa-btn-spinner" /> : "Set Up 2FA"}
              </button>
            </div>
          )}

          {/* Step 1: QR Code & Verification */}
          {currentStep === 1 && enrollmentData && (
            <div className="tfa-step-content">
              <div className="tfa-alert tfa-alert--info">
                <Info className="tfa-alert-icon" size={18} />
                <div className="tfa-alert-content">
                  <p className="tfa-alert-text">Scan this QR code with your authenticator app</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="tfa-qr-container">
                <img src={enrollmentData.qrCode} alt="2FA QR Code" className="tfa-qr-code" />
              </div>

              {/* Manual entry */}
              <div className="tfa-secret-wrapper">
                <h3 className="tfa-section-title">
                  <Key size={16} />
                  Manual Entry
                </h3>
                <div className="tfa-secret-input-group">
                  <input
                    type="text"
                    className="tfa-secret-input"
                    value={enrollmentData.secret}
                    readOnly
                    onClick={(e) => e.target.select()}
                  />
                  <button className="tfa-btn tfa-btn--copy" onClick={handleCopySecret}>
                    {copySuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copySuccess ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Verification */}
              <div className="tfa-code-wrapper">
                <h3 className="tfa-section-title">Enter Verification Code</h3>
                <div className="tfa-code-input-group">
                  <input
                    ref={codeInputRef}
                    type="text"
                    className="tfa-code-input"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={handleCodeChange}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  <button
                    className="tfa-btn tfa-btn--verify"
                    onClick={handleVerifyCode}
                    disabled={loading || verificationCode.length !== 6}>
                    {loading ? <div className="tfa-btn-spinner" /> : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Success / Management */}
          {currentStep === 2 && (
            <div className="tfa-step-content">
              <div className="tfa-alert tfa-alert--success">
                <CheckCircle className="tfa-alert-icon" size={18} />
                <div className="tfa-alert-content">
                  <p className="tfa-alert-title">2FA is Active</p>
                  <p className="tfa-alert-text">You&apos;ll need your authenticator app when signing in.</p>
                </div>
              </div>

              {existingFactors.length > 0 && (
                <>
                  <h3 className="tfa-section-title">Active Authenticators</h3>
                  <div className="tfa-factor-list">
                    {existingFactors.map((factor) => (
                      <div key={factor.id} className="tfa-factor-item">
                        <div className="tfa-factor-info">
                          <div className="tfa-factor-icon">
                            <Shield size={18} />
                          </div>
                          <div className="tfa-factor-details">
                            <span className="tfa-factor-name">Authenticator App</span>
                            <span className="tfa-factor-status">{factor.status || "Verified"}</span>
                          </div>
                        </div>
                        <button
                          className="tfa-btn tfa-btn--danger"
                          onClick={() => handleDisable2FA(factor.id)}
                          disabled={loading}>
                          {loading ? <div className="tfa-btn-spinner" /> : "Disable"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="tfa-alert tfa-alert--warning">
                    <AlertTriangle className="tfa-alert-icon" size={18} />
                    <div className="tfa-alert-content">
                      <p className="tfa-alert-text">
                        Make sure you have access to your authenticator. If you lose it, you may not be able to sign in.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <button className="tfa-btn tfa-btn--success" onClick={handleClose}>
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="tfa-footer">
          <p className="tfa-footer-text">
            Lost access to your authenticator? <a href="mailto:support@game-datacards.eu">Contact support</a>
          </p>
        </footer>
      </div>
    </div>,
    modalRoot
  );
};

export default TwoFactorSetup;

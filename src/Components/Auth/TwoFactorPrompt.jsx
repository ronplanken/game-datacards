/**
 * TwoFactorPrompt Component
 *
 * Compact modal for 2FA verification during login.
 * Designed as a quick "security checkpoint" - focused and minimal.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { Shield, X, AlertCircle } from "lucide-react";
import { useAuth } from "../../Hooks/useAuth";
import "./TwoFactorPrompt.css";

const modalRoot = document.getElementById("modal-root");

export const TwoFactorPrompt = ({ visible, onCancel, onSuccess, factorId, challengeId }) => {
  const { verify2FA } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const inputRef = useRef(null);

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
   * Focus input when modal opens
   */
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  /**
   * Clear state when modal opens/closes
   */
  useEffect(() => {
    if (visible) {
      setCode("");
      setError(null);
      setLoading(false);
      setIsExiting(false);
    }
  }, [visible]);

  /**
   * Close with animation
   */
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setCode("");
      setError(null);
      if (onCancel) onCancel();
    }, 150);
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
   * Handle code verification
   * @param {string} codeToVerify - Optional code to verify (used for auto-submit to avoid stale state)
   */
  const handleVerify = async (codeToVerify) => {
    const verifyCode = codeToVerify || code;

    if (!verifyCode || verifyCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    if (!factorId || !challengeId) {
      setError("Missing authentication data. Please try signing in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await verify2FA(factorId, challengeId, verifyCode);

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || "Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input change - only allow digits
   */
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError(null);

    // Auto-submit when 6 digits entered - pass value directly to avoid stale state
    if (value.length === 6) {
      setTimeout(() => {
        handleVerify(value);
      }, 100);
    }
  };

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className={`tfp-overlay ${isExiting ? "tfp-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div className="tfp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="tfp-header">
          <button className="tfp-close" onClick={handleClose} aria-label="Close">
            <X size={16} />
          </button>

          <div className="tfp-icon">
            <Shield />
          </div>

          <h2 className="tfp-title">Verification Required</h2>
          <p className="tfp-subtitle">Enter the code from your authenticator app</p>
        </header>

        {/* Body */}
        <div className="tfp-body">
          {/* Code input */}
          <div className="tfp-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="tfp-input"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={loading}
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="tfp-error">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="tfp-actions">
            <button className="tfp-btn tfp-btn--primary" onClick={handleVerify} disabled={loading || code.length !== 6}>
              {loading ? <div className="tfp-spinner" /> : "Verify"}
            </button>

            <button className="tfp-btn tfp-btn--secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="tfp-footer">
          <p className="tfp-footer-text">
            Lost access? <a href="mailto:support@game-datacards.eu">Contact support</a>
          </p>
        </footer>
      </div>
    </div>,
    modalRoot
  );
};

export default TwoFactorPrompt;

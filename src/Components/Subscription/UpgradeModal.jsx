/**
 * UpgradeModal Component
 *
 * Premium upgrade modal with dark navy theme and gold accents.
 * Features comparison, pricing, and call-to-action.
 */

import React, { useState, useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { Crown, X, Check, Database, Upload, Share2, Zap, Headphones, AlertTriangle } from "lucide-react";
import { useSubscription } from "../../Hooks/useSubscription";
import "./UpgradeModal.css";

const modalRoot = document.getElementById("modal-root");

export const UpgradeModal = ({ visible, onCancel, trigger = "manual" }) => {
  const [isExiting, setIsExiting] = useState(false);
  const { usage, getLimits, startCheckout, isPaidTierEnabled } = useSubscription();

  const freeLimits = getLimits("free");
  const paidLimits = getLimits("paid");

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
      setIsExiting(false);
    }
  }, [visible]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      if (onCancel) onCancel();
    }, 200);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleUpgrade = async () => {
    const productId = process.env.REACT_APP_CREEM_PRODUCT_ID;
    if (!productId) {
      console.error("REACT_APP_CREEM_PRODUCT_ID not configured");
      return;
    }
    const result = await startCheckout(productId);
    if (result.success) {
      onCancel();
    }
  };

  // Trigger-specific alert message
  const getTriggerAlert = () => {
    switch (trigger) {
      case "category_limit":
        return {
          show: true,
          message: `You've reached your limit of ${freeLimits.categories} backed-up categories.`,
          icon: <Database size={18} />,
        };
      case "datasource_limit":
        return {
          show: true,
          message: "Uploading custom datasources is a premium feature.",
          icon: <Upload size={18} />,
        };
      default:
        return { show: false };
    }
  };

  const triggerAlert = getTriggerAlert();

  const features = [
    {
      icon: <Database size={18} />,
      title: "Cloud Backup",
      desc: `Save up to ${paidLimits.categories} categories`,
    },
    {
      icon: <Upload size={18} />,
      title: "Custom Datasources",
      desc: `Upload ${paidLimits.datasources}+ datasources`,
    },
    {
      icon: <Share2 size={18} />,
      title: "Community Sharing",
      desc: "Share with other players",
    },
    {
      icon: <Zap size={18} />,
      title: "Auto-Sync",
      desc: "Seamless sync across devices",
    },
    {
      icon: <Headphones size={18} />,
      title: "Priority Support",
      desc: "Get help when you need it",
    },
  ];

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className={`upgrade-overlay ${isExiting ? "upgrade-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="upgrade-header">
          <button className="upgrade-close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>

          <div className="upgrade-crown">
            <Crown size={24} />
          </div>

          <h1 className="upgrade-title">Upgrade to Premium</h1>
          <p className="upgrade-subtitle">Unlock the full potential of Game Datacards</p>
        </header>

        {/* Body */}
        <div className="upgrade-body">
          {/* Trigger alert */}
          {triggerAlert.show && (
            <div className="upgrade-trigger-alert">
              <AlertTriangle className="upgrade-trigger-alert-icon" size={20} />
              <span className="upgrade-trigger-alert-text">{triggerAlert.message}</span>
            </div>
          )}

          {/* Features */}
          <div className="upgrade-features">
            {features.map((feature, index) => (
              <div className="upgrade-feature" key={index}>
                <div className="upgrade-feature-icon">{feature.icon}</div>
                <div className="upgrade-feature-content">
                  <div className="upgrade-feature-title">{feature.title}</div>
                  <div className="upgrade-feature-desc">{feature.desc}</div>
                </div>
                <Check className="upgrade-feature-check" size={18} />
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="upgrade-pricing">
            <div className="upgrade-pricing-header">
              <span className="upgrade-pricing-amount">$5.99</span>
              <span className="upgrade-pricing-period">/ month</span>
            </div>
            <div className="upgrade-pricing-note">Cancel anytime. Billed monthly.</div>
          </div>

          {/* CTA */}
          {isPaidTierEnabled ? (
            <button className="upgrade-cta" onClick={handleUpgrade}>
              <Crown size={18} />
              <span>Upgrade Now</span>
            </button>
          ) : (
            <button className="upgrade-cta upgrade-cta--soon" disabled>
              Coming Soon
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="upgrade-footer">
          <p className="upgrade-footer-text">
            Secure payment powered by{" "}
            <a href="https://polar.sh" target="_blank" rel="noopener noreferrer">
              Polar.sh
            </a>
            <br />
            Your support helps keep Game Datacards free for everyone.
          </p>
        </footer>
      </div>
    </div>,
    modalRoot
  );
};

export default UpgradeModal;

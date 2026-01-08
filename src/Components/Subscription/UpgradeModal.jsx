/**
 * UpgradeModal Component
 *
 * Two-step premium upgrade modal:
 * Step 1: Tier selection (Premium vs Creator)
 * Step 2: Detailed checkout for selected tier
 */

import React, { useState, useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import {
  Crown,
  Star,
  X,
  Check,
  Database,
  Upload,
  Share2,
  Zap,
  Headphones,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { useSubscription } from "../../Hooks/useSubscription";
import "./UpgradeModal.css";

const modalRoot = document.getElementById("modal-root");

// Tier configurations
const TIER_CONFIG = {
  premium: {
    id: "premium",
    name: "Premium",
    icon: Crown,
    price: "€3.99",
    period: "/ month",
    tagline: "Expand your workflow",
    color: "gold",
    highlights: ["50 cloud-backed categories", "2 custom datasources", "Community sharing", "Priority support"],
    features: [
      {
        icon: Database,
        title: "Cloud Backup",
        desc: "Save up to 50 categories across devices",
      },
      {
        icon: Upload,
        title: "Custom Datasources",
        desc: "Upload up to 2 custom datasources",
      },
      {
        icon: Share2,
        title: "Community Sharing",
        desc: "Share your creations with other players",
      },
      {
        icon: Zap,
        title: "Auto-Sync",
        desc: "Seamless sync across all your devices",
      },
      {
        icon: Headphones,
        title: "Premium Support",
        desc: "Get help when you need it",
      },
    ],
  },
  creator: {
    id: "creator",
    name: "Creator",
    icon: Star,
    price: "€7.99",
    period: "/ month",
    tagline: "Maximum flexibility",
    color: "rose",
    badge: "Most Popular",
    highlights: [
      "250 cloud-backed categories",
      "10 custom datasources",
      "Priority feature requests",
      "Priority support queue",
    ],
    features: [
      {
        icon: Database,
        title: "Massive Storage",
        desc: "Save up to 250 categories across devices",
      },
      {
        icon: Upload,
        title: "Extended Datasources",
        desc: "Upload up to 10 custom datasources",
      },
      {
        icon: Rocket,
        title: "Priority Features",
        desc: "Your feature requests go to the front",
      },
      {
        icon: Share2,
        title: "Community Sharing",
        desc: "Share your creations with other players",
      },
      {
        icon: Zap,
        title: "Auto-Sync",
        desc: "Seamless sync across all your devices",
      },
      {
        icon: Headphones,
        title: "Priority Support",
        desc: "Jump to the front of the support queue",
      },
    ],
  },
};

export const UpgradeModal = ({ visible, onCancel, trigger = "manual" }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState("select"); // "select" | "checkout"
  const [selectedTier, setSelectedTier] = useState(null);
  const [stepDirection, setStepDirection] = useState("forward");
  const { getLimits, startCheckout, isPaidTierEnabled } = useSubscription();

  const freeLimits = getLimits("free");

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
      setError(null);
      setIsLoading(false);
      setCurrentStep("select");
      setSelectedTier(null);
      setStepDirection("forward");
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

  const handleTierSelect = (tierId) => {
    setSelectedTier(tierId);
  };

  const handleContinue = () => {
    if (selectedTier) {
      setStepDirection("forward");
      setCurrentStep("checkout");
    }
  };

  const handleBack = () => {
    setStepDirection("backward");
    setCurrentStep("select");
    setError(null);
  };

  const handleUpgrade = async () => {
    setError(null);
    setIsLoading(true);

    // Get the appropriate product ID based on selected tier
    const productId =
      selectedTier === "creator"
        ? process.env.REACT_APP_CREEM_PRODUCT_ID_CREATOR
        : process.env.REACT_APP_CREEM_PRODUCT_ID;

    if (!productId) {
      setError("Payment service is not configured. Please try again later.");
      setIsLoading(false);
      return;
    }

    const result = await startCheckout(productId);
    setIsLoading(false);

    if (result.success) {
      onCancel();
    } else if (result.error) {
      setError(result.error);
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
  const tierConfig = selectedTier ? TIER_CONFIG[selectedTier] : null;

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className={`upgrade-overlay ${isExiting ? "upgrade-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div
        className={`upgrade-modal ${
          selectedTier && currentStep === "checkout" ? `upgrade-modal--${TIER_CONFIG[selectedTier].color}` : ""
        }`}
        onClick={(e) => e.stopPropagation()}>
        {/* Step 1: Tier Selection */}
        {currentStep === "select" && (
          <div
            className={`upgrade-step upgrade-step--select ${
              stepDirection === "backward" ? "upgrade-step--enter-back" : ""
            }`}>
            {/* Header */}
            <header className="upgrade-header upgrade-header--select">
              <button className="upgrade-close" onClick={handleClose} aria-label="Close">
                <X size={18} />
              </button>

              <h1 className="upgrade-title">Choose Your Plan</h1>
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

              {/* Tier Cards */}
              <div className="upgrade-tiers">
                {Object.values(TIER_CONFIG).map((tier) => {
                  const TierIcon = tier.icon;
                  const isSelected = selectedTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      className={`upgrade-tier-card upgrade-tier-card--${tier.color} ${
                        isSelected ? "upgrade-tier-card--selected" : ""
                      }`}
                      onClick={() => handleTierSelect(tier.id)}
                      type="button">
                      {/* Badge */}
                      {tier.badge && <div className="upgrade-tier-badge">{tier.badge}</div>}

                      {/* Selection indicator */}
                      <div className="upgrade-tier-check">
                        <Check size={14} />
                      </div>

                      {/* Icon */}
                      <div className="upgrade-tier-icon">
                        <TierIcon size={24} />
                      </div>

                      {/* Name & Tagline */}
                      <h3 className="upgrade-tier-name">{tier.name}</h3>
                      <p className="upgrade-tier-tagline">{tier.tagline}</p>

                      {/* Price */}
                      <div className="upgrade-tier-price">
                        <span className="upgrade-tier-amount">{tier.price}</span>
                        <span className="upgrade-tier-period">{tier.period}</span>
                      </div>

                      {/* Highlights */}
                      <ul className="upgrade-tier-highlights">
                        {tier.highlights.map((highlight, idx) => (
                          <li key={idx} className="upgrade-tier-highlight">
                            <Check size={14} className="upgrade-tier-highlight-check" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              {/* Continue Button */}
              <button className="upgrade-continue" onClick={handleContinue} disabled={!selectedTier}>
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Footer */}
            <footer className="upgrade-footer">
              <p className="upgrade-footer-text">
                Cancel anytime. Secure payment powered by{" "}
                <a href="https://creem.io" target="_blank" rel="noopener noreferrer">
                  Creem
                </a>
              </p>
            </footer>
          </div>
        )}

        {/* Step 2: Checkout Details */}
        {currentStep === "checkout" && tierConfig && (
          <div
            className={`upgrade-step upgrade-step--checkout ${
              stepDirection === "forward" ? "upgrade-step--enter-forward" : ""
            }`}>
            {/* Header */}
            <header className="upgrade-header">
              <button className="upgrade-back" onClick={handleBack} aria-label="Back">
                <ArrowLeft size={18} />
              </button>

              <button className="upgrade-close" onClick={handleClose} aria-label="Close">
                <X size={18} />
              </button>

              <div className="upgrade-crown">
                <tierConfig.icon size={24} />
              </div>

              <h1 className="upgrade-title">Upgrade to {tierConfig.name}</h1>
              <p className="upgrade-subtitle">{tierConfig.tagline}</p>
            </header>

            {/* Body */}
            <div className="upgrade-body">
              {/* Features */}
              <div className="upgrade-features">
                {tierConfig.features.map((feature, index) => (
                  <div className="upgrade-feature" key={index}>
                    <div className="upgrade-feature-icon">
                      <feature.icon size={18} />
                    </div>
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
                  <span className="upgrade-pricing-amount">{tierConfig.price}</span>
                  <span className="upgrade-pricing-period">{tierConfig.period}</span>
                </div>
                <div className="upgrade-pricing-note">Cancel anytime. Billed monthly.</div>
              </div>

              {/* Error message */}
              {error && (
                <div className="upgrade-error">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* CTA */}
              {isPaidTierEnabled ? (
                <button className="upgrade-cta" onClick={handleUpgrade} disabled={isLoading}>
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <tierConfig.icon size={18} />
                      <span>Upgrade Now</span>
                    </>
                  )}
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
                <a href="https://creem.io" target="_blank" rel="noopener noreferrer">
                  Creem
                </a>
                <br />
                Your support helps keep Game Datacards free for everyone.
              </p>
            </footer>
          </div>
        )}
      </div>
    </div>,
    modalRoot
  );
};

export default UpgradeModal;

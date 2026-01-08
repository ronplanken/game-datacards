/**
 * CheckoutSuccessModal Component
 *
 * Celebratory modal shown after successful subscription.
 * Supports Premium (gold) and Creator (rose gold) tiers.
 */

import React, { useState, useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { Crown, Sparkles, Database, Upload, Share2, Zap, Headphones, ArrowRight, Star, Rocket } from "lucide-react";
import "./CheckoutSuccessModal.css";

const modalRoot = document.getElementById("modal-root");

// Generate random sparkle positions
const generateSparkles = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 1.5,
    size: 4 + Math.random() * 8,
  }));
};

// Tier configurations
const TIER_CONFIG = {
  premium: {
    title: "Welcome to Premium!",
    subtitle: "Your upgrade was successful. Time to expand your datacards workflow.",
    badge: Crown,
    features: [
      {
        icon: <Database size={20} />,
        title: "Cloud Backup",
        desc: "Save up to 50 categories across devices",
      },
      {
        icon: <Upload size={20} />,
        title: "Multiple Datasources",
        desc: "Work with up to 2 custom datasources",
      },
      {
        icon: <Share2 size={20} />,
        title: "Community Sharing",
        desc: "Share your creations with other players",
      },
      {
        icon: <Zap size={20} />,
        title: "Auto-Sync",
        desc: "Seamless sync across all your devices",
      },
      {
        icon: <Headphones size={20} />,
        title: "Premium Support",
        desc: "Get help when you need it",
      },
    ],
  },
  creator: {
    title: "Welcome to Creator!",
    subtitle: "Maximum flexibility unlocked. You're ready to create at scale.",
    badge: Star,
    features: [
      {
        icon: <Database size={20} />,
        title: "Massive Storage",
        desc: "Save up to 250 categories across devices",
      },
      {
        icon: <Upload size={20} />,
        title: "Extended Datasources",
        desc: "Work with up to 10 custom datasources",
      },
      {
        icon: <Rocket size={20} />,
        title: "Priority Features",
        desc: "Your feature requests go to the front of the queue",
      },
      {
        icon: <Share2 size={20} />,
        title: "Community Sharing",
        desc: "Share your creations with other players",
      },
      {
        icon: <Zap size={20} />,
        title: "Auto-Sync",
        desc: "Seamless sync across all your devices",
      },
      {
        icon: <Headphones size={20} />,
        title: "Priority Support",
        desc: "Jump to the front of the support queue",
      },
    ],
  },
};

export const CheckoutSuccessModal = ({ visible, onClose, tier = "premium" }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [sparkles] = useState(() => generateSparkles(20));

  const config = TIER_CONFIG[tier] || TIER_CONFIG.premium;
  const BadgeIcon = config.badge;

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
      if (onClose) onClose();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div
      className={`success-overlay success-overlay--${tier} ${isExiting ? "success-overlay--exiting" : ""}`}
      onClick={handleOverlayClick}>
      {/* Sparkle particles */}
      <div className="success-sparkles">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="success-sparkle"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
            }}
          />
        ))}
      </div>

      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        {/* Celebration burst effect */}
        <div className="success-burst" />
        <div className="success-burst success-burst--delayed" />

        {/* Header */}
        <header className="success-header">
          <div className="success-badge">
            <div className="success-badge-ring" />
            <div className="success-badge-ring success-badge-ring--2" />
            <div className="success-badge-icon">
              <BadgeIcon size={32} />
            </div>
          </div>

          <div className="success-confetti">
            <Sparkles className="success-confetti-icon success-confetti-icon--1" size={16} />
            <Sparkles className="success-confetti-icon success-confetti-icon--2" size={14} />
            <Sparkles className="success-confetti-icon success-confetti-icon--3" size={18} />
          </div>

          <h1 className="success-title">{config.title}</h1>
          <p className="success-subtitle">{config.subtitle}</p>
        </header>

        {/* Body */}
        <div className="success-body">
          <div className="success-features-label">
            <span>You now have access to</span>
          </div>

          <div className="success-features">
            {config.features.map((feature, index) => (
              <div className="success-feature" key={index} style={{ animationDelay: `${0.4 + index * 0.08}s` }}>
                <div className="success-feature-icon">{feature.icon}</div>
                <div className="success-feature-content">
                  <div className="success-feature-title">{feature.title}</div>
                  <div className="success-feature-desc">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="success-footer">
          <button className="success-cta" onClick={handleClose}>
            <span>Start Exploring</span>
            <ArrowRight size={18} />
          </button>
          <p className="success-footer-text">Thank you for supporting Game Datacards!</p>
        </footer>
      </div>
    </div>,
    modalRoot
  );
};

export default CheckoutSuccessModal;

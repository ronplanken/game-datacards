/**
 * AccountButton Component
 *
 * Displays authentication state and provides access to account features:
 * - Login button when not authenticated
 * - User menu dropdown when authenticated
 * - Handles modal state for login/signup
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Settings, Share2, LogOut, Crown, Shield } from "lucide-react";
import { LogIn } from "lucide-react";
import "./AccountButton.css";
import "./UserMenu.css";
import { useAuth } from "../../Hooks/useAuth";
import { useSubscription } from "../../Hooks/useSubscription";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import TwoFactorSetup from "./TwoFactorSetup";
import TwoFactorPrompt from "./TwoFactorPrompt";
import UpgradeModal from "../Subscription/UpgradeModal";

export const AccountButton = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const { getTier, openCustomerPortal } = useSubscription();
  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [twoFactorVisible, setTwoFactorVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 2FA login prompt state - lifted from LoginModal so it persists during auth state changes
  const [twoFactorLoginVisible, setTwoFactorLoginVisible] = useState(false);
  const [twoFactorLoginData, setTwoFactorLoginData] = useState(null);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  /**
   * Handle click outside to close menu
   */
  const handleClickOutside = useCallback((e) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      triggerRef.current &&
      !triggerRef.current.contains(e.target)
    ) {
      setMenuOpen(false);
    }
  }, []);

  /**
   * Handle ESC key to close menu
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, handleClickOutside, handleKeyDown]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
  };

  /**
   * Handle MFA required during login
   * Called by LoginModal when user has 2FA enabled
   * Note: We don't close the login modal - the 2FA prompt overlays on top (higher z-index)
   */
  const handleMFARequired = (factorId, challengeId) => {
    setTwoFactorLoginData({ factorId, challengeId });
    setTwoFactorLoginVisible(true);
  };

  /**
   * Handle MFA verification success
   */
  const handleMFASuccess = () => {
    setTwoFactorLoginVisible(false);
    setTwoFactorLoginData(null);
    setLoginVisible(false); // Also close the login modal behind
  };

  /**
   * Handle MFA verification cancelled
   */
  const handleMFACancel = () => {
    setTwoFactorLoginVisible(false);
    setTwoFactorLoginData(null);
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = () => {
    if (!user) return "";
    return user.user_metadata?.display_name || user.email?.split("@")[0] || "User";
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const tier = getTier();
  const isPremium = tier !== "free";

  /**
   * Menu item click handler
   */
  const handleMenuItemClick = (action) => {
    setMenuOpen(false);
    action();
  };

  // Render main content based on auth state
  const renderContent = () => {
    // Show loading state
    if (loading && !user) {
      return (
        <div className="user-menu-container">
          <button className="user-avatar-trigger" disabled>
            <div className="user-avatar user-avatar--free" style={{ opacity: 0.5 }}>
              ...
            </div>
          </button>
        </div>
      );
    }

    // Not authenticated - show login button
    if (!isAuthenticated) {
      return (
        <>
          <button className="header-signin-btn" onClick={() => setLoginVisible(true)}>
            <span className="header-signin-btn-bg" />
            <LogIn className="header-signin-btn-icon" size={16} />
            <span className="header-signin-btn-text">Sign In</span>
          </button>

          <LoginModal
            visible={loginVisible}
            onCancel={() => setLoginVisible(false)}
            onSwitchToSignup={() => {
              setLoginVisible(false);
              setSignupVisible(true);
            }}
            onSuccess={() => setLoginVisible(false)}
            onMFARequired={handleMFARequired}
          />

          <SignupModal
            visible={signupVisible}
            onCancel={() => setSignupVisible(false)}
            onSwitchToLogin={() => {
              setSignupVisible(false);
              setLoginVisible(true);
            }}
            onSuccess={() => setSignupVisible(false)}
          />
        </>
      );
    }

    // Authenticated - show user menu
    return (
      <>
        <div className="user-menu-container">
          {/* Avatar trigger */}
          <button
            ref={triggerRef}
            className="user-avatar-trigger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            data-testid="user-menu">
            <div className={`user-avatar ${isPremium ? "" : "user-avatar--free"}`}>{getUserInitials()}</div>
          </button>

          {/* Dropdown menu */}
          <div ref={menuRef} className={`user-menu ${menuOpen ? "user-menu--open" : ""}`} role="menu">
            {/* User info header */}
            <div className="user-menu-header">
              <div className="user-menu-header-content">
                <div className={`user-menu-header-avatar ${isPremium ? "" : "user-menu-header-avatar--free"}`}>
                  {getUserInitials()}
                </div>
                <div className="user-menu-header-info">
                  <div className="user-menu-header-name">
                    <span className="user-menu-header-name-text">{getUserDisplayName()}</span>
                    <span
                      className={`user-menu-tier-badge ${
                        isPremium ? "user-menu-tier-badge--premium" : "user-menu-tier-badge--free"
                      }`}>
                      {isPremium && <Crown size={10} />}
                      {isPremium ? "Premium" : "Free"}
                    </span>
                  </div>
                  <div className="user-menu-header-email">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="user-menu-items">
              <button
                className="user-menu-item"
                onClick={() => handleMenuItemClick(() => console.log("Open account settings"))}
                role="menuitem">
                <span className="user-menu-item-icon">
                  <Settings size={14} />
                </span>
                <span className="user-menu-item-text">Account Settings</span>
              </button>

              <button
                className="user-menu-item"
                onClick={() => handleMenuItemClick(() => console.log("Open my shares"))}
                role="menuitem">
                <span className="user-menu-item-icon">
                  <Share2 size={14} />
                </span>
                <span className="user-menu-item-text">My Shares</span>
              </button>

              <button
                className="user-menu-item"
                onClick={() => handleMenuItemClick(() => setTwoFactorVisible(true))}
                role="menuitem">
                <span className="user-menu-item-icon">
                  <Shield size={14} />
                </span>
                <span className="user-menu-item-text">Two-Factor Auth</span>
              </button>

              <div className="user-menu-divider" />

              {/* Upgrade or Manage Subscription */}
              {tier === "free" ? (
                <button
                  className="user-menu-item user-menu-item--upgrade"
                  onClick={() => handleMenuItemClick(() => setUpgradeVisible(true))}
                  role="menuitem">
                  <span className="user-menu-item-icon">
                    <Crown size={14} />
                  </span>
                  <span className="user-menu-item-text">Upgrade to Premium</span>
                </button>
              ) : (
                <button
                  className="user-menu-item"
                  onClick={() => handleMenuItemClick(() => openCustomerPortal())}
                  role="menuitem">
                  <span className="user-menu-item-icon">
                    <Crown size={14} />
                  </span>
                  <span className="user-menu-item-text">Manage Subscription</span>
                </button>
              )}

              <div className="user-menu-divider" />

              <button className="user-menu-item user-menu-item--signout" onClick={handleLogout} role="menuitem">
                <span className="user-menu-item-icon">
                  <LogOut size={14} />
                </span>
                <span className="user-menu-item-text">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <UpgradeModal visible={upgradeVisible} onCancel={() => setUpgradeVisible(false)} trigger="manual" />

        <TwoFactorSetup
          visible={twoFactorVisible}
          onCancel={() => setTwoFactorVisible(false)}
          onSuccess={() => setTwoFactorVisible(false)}
        />
      </>
    );
  };

  // Main render - includes TwoFactorPrompt at root level so it persists during auth state changes
  return (
    <>
      {renderContent()}

      {/* 2FA login prompt - rendered at root level to persist during auth state changes */}
      <TwoFactorPrompt
        visible={twoFactorLoginVisible}
        factorId={twoFactorLoginData?.factorId}
        challengeId={twoFactorLoginData?.challengeId}
        onCancel={handleMFACancel}
        onSuccess={handleMFASuccess}
      />
    </>
  );
};

export default AccountButton;

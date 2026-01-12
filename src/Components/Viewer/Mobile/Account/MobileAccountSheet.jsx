import { useNavigate } from "react-router-dom";
import { Shield, LogOut, ChevronRight, Sparkles, Crown, Cloud } from "lucide-react";
import { useAuth } from "../../../../Hooks/useAuth";
import { useSubscription } from "../../../../Hooks/useSubscription";
import { useSync } from "../../../../Hooks/useSync";
import { BottomSheet } from "../BottomSheet";
import "./MobileAccount.css";

// Get initials from name or email
const getInitials = (user, profile) => {
  const displayName = profile?.display_name || user?.user_metadata?.display_name;
  if (displayName) {
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  // Fall back to email
  if (user?.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "??";
};

// Get display name
const getDisplayName = (user, profile) => {
  return profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
};

// Tier badge component
const TierBadge = ({ tier }) => {
  const tierLabels = {
    free: "Free",
    premium: "Premium",
    creator: "Creator",
    lifetime: "Lifetime",
    admin: "Admin",
  };

  return <span className={`account-tier-badge account-tier-badge--${tier}`}>{tierLabels[tier] || "Free"}</span>;
};

// Usage bar component
const UsageBar = ({ label, current, max }) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isWarning = percentage >= 80 && percentage < 100;
  const isFull = percentage >= 100;

  let fillClass = "account-usage-bar-fill";
  if (isFull) fillClass += " account-usage-bar-fill--full";
  else if (isWarning) fillClass += " account-usage-bar-fill--warning";

  return (
    <div className="account-usage-row">
      <div className="account-usage-label">
        <span className="account-usage-name">{label}</span>
        <span className="account-usage-count">
          {current}/{max}
        </span>
      </div>
      <div className="account-usage-bar">
        <div className={fillClass} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export const MobileAccountSheet = ({ isVisible, setIsVisible, onOpenSync }) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { subscription, getLimits, usage, openCustomerPortal } = useSubscription();
  const { globalSyncStatus } = useSync();

  const handleClose = () => setIsVisible(false);

  const handleSignOut = async () => {
    handleClose();
    await signOut();
    navigate("/mobile", { replace: true });
  };

  const handleUpgrade = () => {
    handleClose();
    navigate("/mobile/upgrade");
  };

  const handleManageSubscription = async () => {
    handleClose();
    await openCustomerPortal();
  };

  const handleTwoFactor = () => {
    handleClose();
    // For now, just show a message - full 2FA setup can be desktop only
    // Or navigate to a mobile 2FA setup page if implemented
    alert("Two-factor authentication can be configured from the desktop version.");
  };

  const handleOpenSync = () => {
    if (onOpenSync) {
      onOpenSync();
    }
  };

  // Get sync status description - use usage.categories for consistency with usage bar
  const cloudCategoryCount = usage?.categories || 0;
  const getSyncDescription = () => {
    if (cloudCategoryCount === 0) return "Sync your lists to the cloud";
    if (globalSyncStatus === "syncing") return "Syncing...";
    if (globalSyncStatus === "pending") return `${cloudCategoryCount} synced, changes pending`;
    if (globalSyncStatus === "conflict") return "Conflicts need attention";
    if (globalSyncStatus === "error") return "Some items failed to sync";
    return `${cloudCategoryCount} list${cloudCategoryCount !== 1 ? "s" : ""} synced`;
  };

  if (!user) return null;

  const initials = getInitials(user, profile);
  const displayName = getDisplayName(user, profile);
  const currentTier = subscription?.tier || "free";
  const limits = getLimits() || { categories: 2, datasources: 0 };
  const currentUsage = usage || { categories: 0, datasources: 0 };

  return (
    <BottomSheet isOpen={isVisible} onClose={handleClose} title="Account" dark>
      <div className="account-stagger">
        {/* User Info Header */}
        <div className="account-sheet-header account-fade-in">
          <div className={`account-sheet-avatar account-sheet-avatar--${currentTier}`}>
            <span className="account-sheet-avatar-initials">{initials}</span>
          </div>
          <div className="account-sheet-info">
            <h3 className="account-sheet-name">{displayName}</h3>
            <p className="account-sheet-email">{user.email}</p>
          </div>
          <TierBadge tier={currentTier} />
        </div>

        {/* Upgrade Banner (for free users) */}
        {currentTier === "free" && (
          <button className="account-upgrade-banner account-fade-in" onClick={handleUpgrade} type="button">
            <div className="account-upgrade-icon">
              <Sparkles size={22} />
            </div>
            <div className="account-upgrade-content">
              <h4 className="account-upgrade-title">Upgrade to Premium</h4>
              <p className="account-upgrade-description">Sync more lists & access community datasources</p>
            </div>
            <ChevronRight size={20} className="account-upgrade-arrow" />
          </button>
        )}

        {/* Usage Stats */}
        <div className={`account-usage account-usage--${currentTier} account-fade-in`}>
          <h4 className="account-usage-title">Usage</h4>
          <UsageBar label="Synced Categories" current={currentUsage.categories} max={limits.categories} />
          {limits.datasources > 0 && (
            <UsageBar label="Custom Datasources" current={currentUsage.datasources} max={limits.datasources} />
          )}
        </div>

        {/* Menu Items */}
        <div className="account-menu account-fade-in">
          {/* Cloud Sync */}
          <button className="account-menu-item" onClick={handleOpenSync} type="button">
            <div className="account-menu-item-icon account-menu-item-icon--accent">
              <Cloud size={18} />
            </div>
            <div className="account-menu-item-content">
              <p className="account-menu-item-label">Cloud Sync</p>
              <p className="account-menu-item-description">{getSyncDescription()}</p>
            </div>
            <ChevronRight size={18} className="account-menu-item-arrow" />
          </button>

          {/* Two-Factor Auth */}
          <button className="account-menu-item" onClick={handleTwoFactor} type="button">
            <div className="account-menu-item-icon account-menu-item-icon--accent">
              <Shield size={18} />
            </div>
            <div className="account-menu-item-content">
              <p className="account-menu-item-label">Two-Factor Authentication</p>
              <p className="account-menu-item-description">Secure your account</p>
            </div>
            <ChevronRight size={18} className="account-menu-item-arrow" />
          </button>

          {/* Manage Subscription (for paid users) */}
          {currentTier !== "free" && (
            <button className="account-menu-item" onClick={handleManageSubscription} type="button">
              <div className="account-menu-item-icon account-menu-item-icon--warning">
                <Crown size={18} />
              </div>
              <div className="account-menu-item-content">
                <p className="account-menu-item-label">Manage Subscription</p>
                <p className="account-menu-item-description">View or cancel your plan</p>
              </div>
              <ChevronRight size={18} className="account-menu-item-arrow" />
            </button>
          )}

          {/* Sign Out */}
          <button className="account-menu-item" onClick={handleSignOut} type="button">
            <div className="account-menu-item-icon account-menu-item-icon--danger">
              <LogOut size={18} />
            </div>
            <div className="account-menu-item-content">
              <p className="account-menu-item-label account-menu-item-label--danger">Sign Out</p>
            </div>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

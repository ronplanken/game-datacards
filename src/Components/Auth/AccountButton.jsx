/**
 * AccountButton Component
 *
 * Displays authentication state and provides access to account features:
 * - Login button when not authenticated
 * - User menu dropdown when authenticated
 * - Handles modal state for login/signup
 */

import React, { useState } from "react";
import { Button, Dropdown, Avatar, Space, Typography } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  ShareAltOutlined,
  LogoutOutlined,
  CrownOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { LogIn } from "lucide-react";
import "./AccountButton.css";
import { useAuth } from "../../Hooks/useAuth";
import { useSubscription } from "../../Hooks/useSubscription";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import TwoFactorSetup from "./TwoFactorSetup";
import SubscriptionBadge from "../Subscription/SubscriptionBadge";
import UpgradeModal from "../Subscription/UpgradeModal";

const { Text } = Typography;

export const AccountButton = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const { getTier, openCustomerPortal } = useSubscription();
  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [twoFactorVisible, setTwoFactorVisible] = useState(false);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await signOut();
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

  /**
   * Authenticated user menu items
   */
  const tier = getTier();
  const menuItems = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <Space direction="vertical" size={4}>
            <div>
              <Text strong>{getUserDisplayName()}</Text>
              <span style={{ marginLeft: 8 }}>
                <SubscriptionBadge size="small" />
              </span>
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {user?.email}
            </Text>
          </Space>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "account",
      icon: <SettingOutlined />,
      label: "Account Settings",
      onClick: () => {
        // TODO: Open account settings modal
        console.log("Open account settings");
      },
    },
    {
      key: "shares",
      icon: <ShareAltOutlined />,
      label: "My Shares",
      onClick: () => {
        // TODO: Open my shares view
        console.log("Open my shares");
      },
    },
    {
      key: "2fa",
      icon: <SafetyOutlined />,
      label: "Two-Factor Auth",
      onClick: () => setTwoFactorVisible(true),
    },
    // Show upgrade for free users, manage subscription for paid users
    tier === "free"
      ? {
          key: "upgrade",
          icon: <CrownOutlined />,
          label: "Upgrade to Premium",
          onClick: () => setUpgradeVisible(true),
        }
      : {
          key: "manage-subscription",
          icon: <CrownOutlined />,
          label: "Manage Subscription",
          onClick: () => openCustomerPortal(),
        },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      onClick: handleLogout,
    },
  ];

  // Show loading state
  if (loading && !user) {
    return (
      <Button type="text" loading icon={<UserOutlined />}>
        Loading...
      </Button>
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
      <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
        <Space style={{ cursor: "pointer" }} data-testid="user-menu">
          <Avatar
            style={{
              backgroundColor: "#1890ff",
              verticalAlign: "middle",
            }}
            size="default">
            {getUserInitials()}
          </Avatar>
          <Text strong style={{ display: "none", "@media (min-width: 768px)": { display: "inline" } }}>
            {getUserDisplayName()}
          </Text>
        </Space>
      </Dropdown>

      <UpgradeModal visible={upgradeVisible} onCancel={() => setUpgradeVisible(false)} trigger="manual" />

      <TwoFactorSetup
        visible={twoFactorVisible}
        onCancel={() => setTwoFactorVisible(false)}
        onSuccess={() => setTwoFactorVisible(false)}
      />
    </>
  );
};

export default AccountButton;

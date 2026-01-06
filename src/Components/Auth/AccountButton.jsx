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
import { UserOutlined, LoginOutlined, SettingOutlined, ShareAltOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../../Hooks/useAuth";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const { Text } = Typography;

export const AccountButton = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);

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
  const menuItems = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <Text strong>{getUserDisplayName()}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {user?.email}
          </Text>
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
        <Button type="primary" icon={<LoginOutlined />} onClick={() => setLoginVisible(true)}>
          Sign In
        </Button>

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
  );
};

export default AccountButton;

/**
 * SubscriptionBadge Component
 *
 * Displays user's subscription tier as a badge:
 * - Shows tier label (Free, Premium, Creator, Lifetime, Admin)
 * - Visual styling based on tier
 * - Optional size variants
 * - Can be used in header, profile, etc.
 */

import React from "react";
import { Tag } from "antd";
import { CrownOutlined, StarOutlined } from "@ant-design/icons";
import { Gem, Infinity } from "lucide-react";
import { useSubscription } from "../../Hooks/useSubscription";

// Tier configuration
const TIER_CONFIG = {
  free: {
    label: "FREE",
    color: "default",
    icon: null,
  },
  premium: {
    label: "PREMIUM",
    color: "gold",
    icon: CrownOutlined,
  },
  creator: {
    label: "CREATOR",
    color: "magenta",
    icon: StarOutlined,
  },
  lifetime: {
    label: "LIFETIME",
    color: "purple",
    icon: Gem,
    isLucide: true,
  },
  admin: {
    label: "ADMIN",
    color: "red",
    icon: Infinity,
    isLucide: true,
  },
};

export const SubscriptionBadge = ({ size = "default", showIcon = true }) => {
  const { getTier } = useSubscription();

  const tier = getTier();
  const config = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const IconComponent = config.icon;

  // Render icon based on type (Ant Design vs Lucide)
  const renderIcon = () => {
    if (!showIcon || !IconComponent) return null;
    if (config.isLucide) {
      return <IconComponent size={size === "small" ? 10 : 12} style={{ marginRight: 4 }} />;
    }
    return <IconComponent />;
  };

  return (
    <Tag
      color={config.color}
      icon={!config.isLucide && showIcon && IconComponent ? <IconComponent /> : null}
      style={{
        fontSize: size === "small" ? "11px" : "12px",
        padding: size === "small" ? "0 4px" : "0 8px",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
      }}>
      {config.isLucide && renderIcon()}
      {config.label}
    </Tag>
  );
};

export default SubscriptionBadge;

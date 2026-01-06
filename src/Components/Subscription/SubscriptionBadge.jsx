/**
 * SubscriptionBadge Component
 *
 * Displays user's subscription tier as a badge:
 * - Shows "Free" or "Premium" label
 * - Visual styling based on tier
 * - Optional size variants
 * - Can be used in header, profile, etc.
 */

import React from "react";
import { Tag } from "antd";
import { CrownOutlined } from "@ant-design/icons";
import { useSubscription } from "../../Hooks/useSubscription";

export const SubscriptionBadge = ({ size = "default", showIcon = true }) => {
  const { getTier, subscription } = useSubscription();

  const tier = getTier();

  if (tier === "paid") {
    return (
      <Tag
        color="gold"
        icon={showIcon ? <CrownOutlined /> : null}
        style={{
          fontSize: size === "small" ? "11px" : "12px",
          padding: size === "small" ? "0 4px" : "0 8px",
          fontWeight: 600,
        }}>
        PREMIUM
      </Tag>
    );
  }

  return (
    <Tag
      color="default"
      style={{
        fontSize: size === "small" ? "11px" : "12px",
        padding: size === "small" ? "0 4px" : "0 8px",
      }}>
      FREE
    </Tag>
  );
};

export default SubscriptionBadge;

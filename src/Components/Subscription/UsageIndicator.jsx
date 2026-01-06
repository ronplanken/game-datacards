/**
 * UsageIndicator Component
 *
 * Shows current usage vs limits for a resource:
 * - Progress bar visualization
 * - Usage numbers (X / Y)
 * - Color coding (green -> yellow -> red)
 * - Warning when approaching limit
 * - Call-to-action to upgrade when at limit
 */

import React from "react";
import { Progress, Space, Typography, Button } from "antd";
import { WarningOutlined, CrownOutlined } from "@ant-design/icons";
import { useSubscription } from "../../Hooks/useSubscription";

const { Text } = Typography;

export const UsageIndicator = ({ resource, label, onUpgrade, showUpgradeButton = true, compact = false }) => {
  const { usage, getLimits, getRemainingQuota, isOverQuota } = useSubscription();

  const limits = getLimits();
  const remaining = getRemainingQuota(resource);
  const atLimit = isOverQuota(resource);

  // Get current usage value
  const currentUsage = usage[resource] || 0;
  const maxUsage = limits[resource] || 0;

  // Calculate percentage
  const percentage = maxUsage > 0 ? Math.min(100, (currentUsage / maxUsage) * 100) : 0;

  // Determine status color
  const getStatusColor = () => {
    if (percentage >= 100) return "exception"; // Red
    if (percentage >= 80) return "normal"; // Yellow
    return "success"; // Green
  };

  const statusColor = getStatusColor();

  if (compact) {
    return (
      <Space size="small" style={{ width: "100%" }}>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {label}:
        </Text>
        <Text strong style={{ fontSize: "12px" }}>
          {currentUsage} / {maxUsage}
        </Text>
        {atLimit && <WarningOutlined style={{ color: "#ff4d4f", fontSize: "12px" }} />}
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text strong>{label}</Text>
        <Text type={atLimit ? "danger" : "secondary"}>
          {currentUsage} / {maxUsage}
        </Text>
      </div>

      <Progress percent={percentage} status={statusColor} showInfo={false} strokeWidth={8} />

      {atLimit && showUpgradeButton && (
        <div style={{ marginTop: 8 }}>
          <Space>
            <WarningOutlined style={{ color: "#ff4d4f" }} />
            <Text type="danger" style={{ fontSize: "12px" }}>
              Limit reached
            </Text>
          </Space>
          <Button
            type="link"
            size="small"
            icon={<CrownOutlined />}
            onClick={onUpgrade}
            style={{ padding: 0, height: "auto", marginLeft: 8 }}>
            Upgrade for more
          </Button>
        </div>
      )}

      {!atLimit && percentage >= 80 && (
        <Text type="warning" style={{ fontSize: "12px" }}>
          {remaining} remaining
        </Text>
      )}
    </Space>
  );
};

export default UsageIndicator;

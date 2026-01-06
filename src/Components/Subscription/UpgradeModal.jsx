/**
 * UpgradeModal Component
 *
 * Modal dialog promoting paid tier upgrade with:
 * - Feature comparison (Free vs Paid)
 * - Usage statistics
 * - Pricing information
 * - Call-to-action button
 * - Trigger contexts (quota reached, manual upgrade)
 */

import React from "react";
import { Modal, Button, Row, Col, Card, Typography, Space, Divider, Tag, List } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  ShareAltOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useSubscription } from "../../Hooks/useSubscription";

const { Title, Text, Paragraph } = Typography;

export const UpgradeModal = ({ visible, onCancel, trigger = "manual" }) => {
  const { usage, getLimits, startCheckout, isPaidTierEnabled } = useSubscription();

  const freeLimits = getLimits("free");
  const paidLimits = getLimits("paid");

  // Trigger-specific messaging
  const getTriggerMessage = () => {
    switch (trigger) {
      case "category_limit":
        return {
          title: "Category Limit Reached",
          description: `You've reached your limit of ${freeLimits.categories} backed-up categories. Upgrade to save up to ${paidLimits.categories} categories in the cloud!`,
          icon: <DatabaseOutlined style={{ fontSize: "48px", color: "#faad14" }} />,
        };

      case "datasource_limit":
        return {
          title: "Datasource Upload Unavailable",
          description:
            "Uploading custom datasources is a premium feature. Upgrade to share your own datasources with the community!",
          icon: <CloudUploadOutlined style={{ fontSize: "48px", color: "#faad14" }} />,
        };

      default:
        return {
          title: "Upgrade to Premium",
          description: "Get unlimited access to all features and support the development of Game Datacards.",
          icon: <CrownOutlined style={{ fontSize: "48px", color: "#faad14" }} />,
        };
    }
  };

  const triggerMessage = getTriggerMessage();

  const handleUpgrade = async () => {
    // TODO: Get actual price ID from Polar.sh configuration
    const priceId = process.env.REACT_APP_POLAR_PRICE_ID || "price_placeholder";

    const result = await startCheckout(priceId);
    if (result.success) {
      // Checkout redirect will happen automatically
      onCancel();
    }
  };

  const features = [
    {
      category: "Cloud Backup",
      free: `${freeLimits.categories} categories`,
      paid: `${paidLimits.categories} categories`,
      icon: <DatabaseOutlined />,
    },
    {
      category: "Custom Datasources",
      free: "View only",
      paid: `Upload ${paidLimits.datasources}+ datasources`,
      icon: <CloudUploadOutlined />,
    },
    {
      category: "Share with Community",
      free: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      paid: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      icon: <ShareAltOutlined />,
    },
    {
      category: "Auto-Sync",
      free: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      paid: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      icon: <CheckCircleOutlined />,
    },
    {
      category: "Priority Support",
      free: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      paid: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <Modal title={null} open={visible} onCancel={onCancel} footer={null} width={700} destroyOnClose centered>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header with icon and message */}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          {triggerMessage.icon}
          <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
            {triggerMessage.title}
          </Title>
          <Paragraph type="secondary" style={{ fontSize: "16px" }}>
            {triggerMessage.description}
          </Paragraph>
        </div>

        {/* Current usage stats */}
        <Card size="small" style={{ backgroundColor: "#f5f5f5" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">Categories backed up:</Text>
              <div>
                <Text strong style={{ fontSize: "20px" }}>
                  {usage.categories}
                </Text>
                <Text type="secondary"> / {freeLimits.categories}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Datasources uploaded:</Text>
              <div>
                <Text strong style={{ fontSize: "20px" }}>
                  {usage.datasources}
                </Text>
                <Text type="secondary"> / {freeLimits.datasources}</Text>
              </div>
            </Col>
          </Row>
        </Card>

        <Divider>Compare Plans</Divider>

        {/* Feature comparison table */}
        <List
          dataSource={features}
          renderItem={(feature) => (
            <List.Item>
              <List.Item.Meta
                avatar={feature.icon}
                title={feature.category}
                description={
                  <Row gutter={16}>
                    <Col span={12}>
                      <Tag color="default">Free: {feature.free}</Tag>
                    </Col>
                    <Col span={12}>
                      <Tag color="gold">Paid: {feature.paid}</Tag>
                    </Col>
                  </Row>
                }
              />
            </List.Item>
          )}
        />

        {/* Pricing */}
        <Card>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Premium Plan
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                <Text strong style={{ fontSize: "24px" }}>
                  €5.99
                </Text>
                <Text type="secondary"> / month</Text>
              </Paragraph>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Cancel anytime. Managed by Polar.sh
              </Text>
            </Col>
            <Col>
              {isPaidTierEnabled ? (
                <Button type="primary" size="large" icon={<CrownOutlined />} onClick={handleUpgrade}>
                  Upgrade Now
                </Button>
              ) : (
                <Button size="large" disabled>
                  Coming Soon
                </Button>
              )}
            </Col>
          </Row>
        </Card>

        {/* Footer note */}
        <div style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Secure payment powered by{" "}
            <a href="https://polar.sh" target="_blank" rel="noopener noreferrer">
              Polar.sh
            </a>
            <br />
            By upgrading, you agree to our Terms of Service and support the ongoing development of Game Datacards.
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

export default UpgradeModal;

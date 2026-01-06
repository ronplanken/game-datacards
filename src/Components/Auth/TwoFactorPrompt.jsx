/**
 * TwoFactorPrompt Component
 *
 * Modal that appears during login when 2FA is required:
 * - Prompts user to enter 6-digit code from authenticator
 * - Handles verification with Supabase
 * - Shows error states
 * - Allows cancellation to return to login
 */

import React, { useState, useEffect, useRef } from "react";
import { Modal, Input, Button, Space, Typography, Alert } from "antd";
import { SafetyOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../Hooks/useAuth";

const { Title, Paragraph, Text } = Typography;

export const TwoFactorPrompt = ({ visible, onCancel, onSuccess, factorId, challengeId }) => {
  const { verify2FA } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  /**
   * Focus input when modal opens
   */
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  /**
   * Clear state when modal closes
   */
  useEffect(() => {
    if (!visible) {
      setCode("");
      setError(null);
      setLoading(false);
    }
  }, [visible]);

  /**
   * Handle code verification
   */
  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    if (!factorId || !challengeId) {
      setError("Missing authentication data. Please try signing in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await verify2FA(factorId, challengeId, code);

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || "Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input change - only allow digits
   */
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError(null);

    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      setTimeout(() => {
        handleVerify();
      }, 100);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          <span>Two-Factor Authentication</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={450}
      destroyOnClose
      maskClosable={false}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Alert
          message="Verification Required"
          description="Enter the 6-digit code from your authenticator app to complete sign in"
          type="info"
          showIcon
          icon={<LockOutlined />}
        />

        {/* Code input */}
        <div>
          <Title level={5}>Authentication Code</Title>
          <Input
            ref={inputRef}
            placeholder="000000"
            value={code}
            onChange={handleCodeChange}
            onPressEnter={handleVerify}
            size="large"
            maxLength={6}
            status={error ? "error" : ""}
            style={{
              textAlign: "center",
              fontSize: "32px",
              letterSpacing: "12px",
              fontWeight: "bold",
            }}
            disabled={loading}
          />
          {error && (
            <Text type="danger" style={{ display: "block", marginTop: "8px", textAlign: "center" }}>
              {error}
            </Text>
          )}
        </div>

        {/* Instructions */}
        <div>
          <Paragraph type="secondary" style={{ margin: 0, textAlign: "center" }}>
            Open your authenticator app and enter the current 6-digit code.
          </Paragraph>
        </div>

        {/* Action buttons */}
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            type="primary"
            size="large"
            block
            onClick={handleVerify}
            loading={loading}
            disabled={code.length !== 6}>
            Verify Code
          </Button>

          <Button size="large" block onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </Space>

        {/* Troubleshooting help */}
        <div style={{ textAlign: "center" }}>
          <Paragraph type="secondary" style={{ fontSize: "12px", margin: 0 }}>
            Lost access to your authenticator? <a href="mailto:support@game-datacards.com">Contact support</a>
          </Paragraph>
        </div>
      </Space>
    </Modal>
  );
};

export default TwoFactorPrompt;

/**
 * TwoFactorSetup Component
 *
 * Modal for setting up Two-Factor Authentication (2FA):
 * - Displays QR code for scanning with authenticator app
 * - Shows secret key as backup
 * - Verifies setup with test code
 * - Lists authenticator app recommendations
 * - Provides unenroll option for existing 2FA
 */

import React, { useState, useEffect } from "react";
import { Modal, Button, Space, Typography, Input, Alert, Steps, Divider, List, message } from "antd";
import { QrcodeOutlined, KeyOutlined, CheckCircleOutlined, SafetyOutlined } from "@ant-design/icons";
import { useAuth } from "../../Hooks/useAuth";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

export const TwoFactorSetup = ({ visible, onCancel, onSuccess }) => {
  const { enroll2FA, verify2FAEnrollment, getFactors, unenroll2FA } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [existingFactors, setExistingFactors] = useState([]);

  /**
   * Load existing factors on mount
   */
  useEffect(() => {
    if (visible) {
      loadFactors();
    }
  }, [visible]);

  /**
   * Load user's existing 2FA factors
   */
  const loadFactors = async () => {
    const result = await getFactors();
    if (result.success) {
      setExistingFactors(result.totpFactors || []);
      // If user already has 2FA, show step 3 (management)
      if (result.totpFactors && result.totpFactors.length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(0);
      }
    }
  };

  /**
   * Start 2FA enrollment process
   */
  const handleStartEnrollment = async () => {
    setLoading(true);
    try {
      const result = await enroll2FA();

      if (result.success) {
        setEnrollmentData(result);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify the setup with code from authenticator
   */
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      message.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const result = await verify2FAEnrollment(enrollmentData.factorId, verificationCode);

      if (result.success) {
        setCurrentStep(2);
        setVerificationCode("");
        if (onSuccess) onSuccess();
        // Reload factors to show the newly enrolled one
        await loadFactors();
      }
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disable 2FA
   */
  const handleDisable2FA = async (factorId) => {
    setLoading(true);
    try {
      const result = await unenroll2FA(factorId);
      if (result.success) {
        await loadFactors();
        setCurrentStep(0);
        setEnrollmentData(null);
      }
    } catch (error) {
      console.error("Unenroll error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setCurrentStep(0);
    setEnrollmentData(null);
    setVerificationCode("");
    if (onCancel) onCancel();
  };

  /**
   * Copy secret to clipboard
   */
  const handleCopySecret = () => {
    if (enrollmentData?.secret) {
      navigator.clipboard.writeText(enrollmentData.secret);
      message.success("Secret copied to clipboard");
    }
  };

  // Authenticator app recommendations
  const authenticatorApps = [
    { name: "Google Authenticator", platforms: "iOS, Android" },
    { name: "Authy", platforms: "iOS, Android, Desktop" },
    { name: "Microsoft Authenticator", platforms: "iOS, Android" },
    { name: "1Password", platforms: "iOS, Android, Desktop, Browser" },
  ];

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          <span>Two-Factor Authentication</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Steps indicator */}
        <Steps current={currentStep} size="small">
          <Step title="Get Started" icon={<SafetyOutlined />} />
          <Step title="Scan QR Code" icon={<QrcodeOutlined />} />
          <Step title="Verified" icon={<CheckCircleOutlined />} />
        </Steps>

        <Divider />

        {/* Step 0: Introduction */}
        {currentStep === 0 && (
          <>
            <Alert
              message="Enhance Your Account Security"
              description="Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password."
              type="info"
              showIcon
            />

            <div>
              <Title level={5}>How it works:</Title>
              <Paragraph>
                <ol>
                  <li>Install an authenticator app on your phone</li>
                  <li>Scan the QR code we provide</li>
                  <li>Enter the 6-digit code to verify setup</li>
                  <li>Use codes from your app when signing in</li>
                </ol>
              </Paragraph>
            </div>

            <div>
              <Title level={5}>Recommended Authenticator Apps:</Title>
              <List
                size="small"
                dataSource={authenticatorApps}
                renderItem={(app) => (
                  <List.Item>
                    <Text strong>{app.name}</Text>
                    <Text type="secondary"> - {app.platforms}</Text>
                  </List.Item>
                )}
              />
            </div>

            <Button type="primary" size="large" block onClick={handleStartEnrollment} loading={loading}>
              Set Up 2FA
            </Button>
          </>
        )}

        {/* Step 1: QR Code Display */}
        {currentStep === 1 && enrollmentData && (
          <>
            <Alert
              message="Step 1: Scan QR Code"
              description="Open your authenticator app and scan this QR code"
              type="info"
              showIcon
            />

            {/* QR Code */}
            <div style={{ textAlign: "center", padding: "20px" }}>
              <img
                src={enrollmentData.qrCode}
                alt="2FA QR Code"
                style={{
                  maxWidth: "250px",
                  border: "2px solid #d9d9d9",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "white",
                }}
              />
            </div>

            {/* Manual entry option */}
            <div>
              <Title level={5}>
                <KeyOutlined /> Can&apos;t scan the code?
              </Title>
              <Paragraph type="secondary">Enter this secret key manually in your authenticator app:</Paragraph>
              <Input.Group compact>
                <Input value={enrollmentData.secret} readOnly style={{ width: "calc(100% - 80px)" }} size="large" />
                <Button type="primary" onClick={handleCopySecret} size="large">
                  Copy
                </Button>
              </Input.Group>
            </div>

            <Divider />

            {/* Verification */}
            <div>
              <Title level={5}>Step 2: Verify Setup</Title>
              <Paragraph>Enter the 6-digit code from your authenticator app:</Paragraph>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  size="large"
                  maxLength={6}
                  style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
                  onPressEnter={handleVerifyCode}
                />
                <Button type="primary" size="large" onClick={handleVerifyCode} loading={loading}>
                  Verify
                </Button>
              </Space.Compact>
            </div>
          </>
        )}

        {/* Step 2: Success / Management */}
        {currentStep === 2 && (
          <>
            <Alert
              message="Two-Factor Authentication Enabled"
              description={
                existingFactors.length > 0
                  ? "Your account is protected with 2FA. You&apos;ll need your authenticator app when signing in."
                  : "2FA has been successfully enabled for your account!"
              }
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />

            {existingFactors.length > 0 && (
              <>
                <div>
                  <Title level={5}>Active Authenticators:</Title>
                  <List
                    size="small"
                    dataSource={existingFactors}
                    renderItem={(factor) => (
                      <List.Item
                        actions={[
                          <Button
                            key="disable"
                            danger
                            size="small"
                            onClick={() => handleDisable2FA(factor.id)}
                            loading={loading}>
                            Disable
                          </Button>,
                        ]}>
                        <List.Item.Meta
                          avatar={<SafetyOutlined style={{ fontSize: "20px" }} />}
                          title="Authenticator App"
                          description={`Status: ${factor.status}`}
                        />
                      </List.Item>
                    )}
                  />
                </div>

                <Alert
                  message="Important"
                  description="Make sure you have access to your authenticator app. If you lose it, you may not be able to sign in to your account."
                  type="warning"
                  showIcon
                />
              </>
            )}

            <Button type="primary" block size="large" onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default TwoFactorSetup;

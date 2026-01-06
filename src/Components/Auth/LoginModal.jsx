/**
 * LoginModal Component
 *
 * Modal dialog for user authentication with:
 * - Email/password login
 * - OAuth providers (Google, GitHub)
 * - Link to signup mode
 * - Password reset
 * - 2FA support (handled in parent)
 */

import React, { useState } from "react";
import { Modal, Form, Input, Button, Divider, Space, Typography } from "antd";
import { GoogleOutlined, GithubOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../Hooks/useAuth";
import TwoFactorPrompt from "./TwoFactorPrompt";

const { Text, Link } = Typography;

export const LoginModal = ({ visible, onCancel, onSwitchToSignup, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const { signIn, signInWithOAuth, resetPassword, getFactors, challenge2FA } = useAuth();

  /**
   * Handle email/password login
   */
  const handleEmailLogin = async (values) => {
    setLoading(true);
    try {
      const { success, error } = await signIn(values.email, values.password);

      if (success) {
        // Check if user has MFA enabled
        const factorsResult = await getFactors();

        if (factorsResult.success && factorsResult.totpFactors && factorsResult.totpFactors.length > 0) {
          // User has 2FA enabled, need to verify
          const factor = factorsResult.totpFactors[0];

          // Create challenge
          const challengeResult = await challenge2FA(factor.id);

          if (challengeResult.success) {
            // Show 2FA prompt
            setTwoFactorData({
              factorId: factor.id,
              challengeId: challengeResult.challengeId,
            });
            setShow2FA(true);
          } else {
            console.error("Failed to create 2FA challenge:", challengeResult.error);
          }
        } else {
          // No 2FA, login complete
          form.resetFields();
          if (onSuccess) onSuccess();
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OAuth login
   */
  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    try {
      const { success } = await signInWithOAuth(provider);
      if (success) {
        // OAuth redirect will happen automatically
        // Modal will close when user returns
      }
    } catch (error) {
      console.error("OAuth error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle password reset
   */
  const handleForgotPassword = async () => {
    try {
      const email = form.getFieldValue("email");
      if (!email) {
        form.validateFields(["email"]);
        return;
      }

      setLoading(true);
      const { success } = await resetPassword(email);
      if (success) {
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle 2FA verification success
   */
  const handle2FASuccess = () => {
    setShow2FA(false);
    setTwoFactorData(null);
    form.resetFields();
    if (onSuccess) onSuccess();
  };

  /**
   * Handle 2FA prompt cancel
   */
  const handle2FACancel = () => {
    setShow2FA(false);
    setTwoFactorData(null);
  };

  /**
   * Handle modal cancel
   */
  const handleCancel = () => {
    form.resetFields();
    setShowForgotPassword(false);
    setShow2FA(false);
    setTwoFactorData(null);
    if (onCancel) onCancel();
  };

  return (
    <Modal
      title={showForgotPassword ? "Reset Password" : "Sign In"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
      destroyOnClose>
      {showForgotPassword ? (
        // Password Reset Mode
        <>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </Text>

          <Form form={form} layout="vertical" onFinish={handleForgotPassword}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}>
              <Input prefix={<MailOutlined />} placeholder="Email address" size="large" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 8 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Send Reset Link
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Link onClick={() => setShowForgotPassword(false)}>Back to Sign In</Link>
            </div>
          </Form>
        </>
      ) : (
        // Login Mode
        <>
          <Form form={form} layout="vertical" onFinish={handleEmailLogin}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}>
              <Input prefix={<MailOutlined />} placeholder="Email address" size="large" autoComplete="email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
              style={{ marginBottom: 8 }}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <Link onClick={() => setShowForgotPassword(true)}>Forgot password?</Link>
            </div>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>Or continue with</Divider>

          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Button
              icon={<GoogleOutlined />}
              onClick={() => handleOAuthLogin("google")}
              loading={loading}
              block
              size="large">
              Sign in with Google
            </Button>

            <Button
              icon={<GithubOutlined />}
              onClick={() => handleOAuthLogin("github")}
              loading={loading}
              block
              size="large">
              Sign in with GitHub
            </Button>
          </Space>

          <Divider />

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">Don&apos;t have an account? </Text>
            <Link onClick={onSwitchToSignup}>Sign up</Link>
          </div>
        </>
      )}

      {/* 2FA Prompt */}
      {show2FA && twoFactorData && (
        <TwoFactorPrompt
          visible={show2FA}
          onCancel={handle2FACancel}
          onSuccess={handle2FASuccess}
          factorId={twoFactorData.factorId}
          challengeId={twoFactorData.challengeId}
        />
      )}
    </Modal>
  );
};

export default LoginModal;

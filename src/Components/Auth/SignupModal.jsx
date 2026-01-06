/**
 * SignupModal Component
 *
 * Modal dialog for user registration with:
 * - Email/password signup
 * - OAuth providers (Google, GitHub)
 * - Password confirmation
 * - Terms acceptance
 * - Link to login mode
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Divider, Space, Checkbox, Typography } from 'antd';
import { GoogleOutlined, GithubOutlined, MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../Hooks/useAuth';

const { Text, Link } = Typography;

export const SignupModal = ({ visible, onCancel, onSwitchToLogin, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithOAuth } = useAuth();

  /**
   * Handle email/password signup
   */
  const handleEmailSignup = async (values) => {
    setLoading(true);
    try {
      const { success } = await signUp(values.email, values.password, {
        display_name: values.name,
      });

      if (success) {
        form.resetFields();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OAuth signup
   */
  const handleOAuthSignup = async (provider) => {
    setLoading(true);
    try {
      const { success } = await signInWithOAuth(provider);
      if (success) {
        // OAuth redirect will happen automatically
      }
    } catch (error) {
      console.error('OAuth signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal cancel
   */
  const handleCancel = () => {
    form.resetFields();
    if (onCancel) onCancel();
  };

  /**
   * Validate password match
   */
  const validatePasswordMatch = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Passwords do not match'));
    },
  });

  return (
    <Modal
      title="Create Account"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleEmailSignup}>
        <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
          <Input prefix={<UserOutlined />} placeholder="Full name" size="large" autoComplete="name" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email address" size="large" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[{ required: true, message: 'Please confirm your password' }, validatePasswordMatch]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm password"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="terms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions')),
            },
          ]}
          style={{ marginBottom: 16 }}
        >
          <Checkbox>
            I agree to the <Link href="/terms" target="_blank">Terms of Service</Link> and{' '}
            <Link href="/privacy" target="_blank">Privacy Policy</Link>
          </Checkbox>
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>Or continue with</Divider>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Button
          icon={<GoogleOutlined />}
          onClick={() => handleOAuthSignup('google')}
          loading={loading}
          block
          size="large"
        >
          Sign up with Google
        </Button>

        <Button
          icon={<GithubOutlined />}
          onClick={() => handleOAuthSignup('github')}
          loading={loading}
          block
          size="large"
        >
          Sign up with GitHub
        </Button>
      </Space>

      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">Already have an account? </Text>
        <Link onClick={onSwitchToLogin}>Sign in</Link>
      </div>
    </Modal>
  );
};

export default SignupModal;

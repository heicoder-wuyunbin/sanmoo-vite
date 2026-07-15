import { MailOutlined, SendOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Modal, Row, Space, Switch, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  fetchEmailConfig,
  updateEmailConfig,
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
} from '@/services/blog/settings-api';
import type { EmailConfig } from '@/services/blog/types';

const EmailSettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const [form] = Form.useForm<EmailConfig>();
  const [loading, setLoading] = useState(false);
  const [, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [configVerified, setConfigVerified] = useState(false);
  const [originalConfig, setOriginalConfig] = useState<EmailConfig | null>(null);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verifyCode, setVerifyCode] = useState('');
  const [identifier, setIdentifier] = useState('');

  // 判断配置是否被修改过
  const isConfigModified = () => {
    if (!originalConfig) return true;
    const current = form.getFieldsValue();
    return (
      current.host !== originalConfig.host ||
      String(current.port) !== String(originalConfig.port) ||
      current.username !== originalConfig.username ||
      current.password !== originalConfig.password
    );
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchEmailConfig();
        const data = res.data || {};
        form.setFieldsValue(data);
        setOriginalConfig(data);
        // 如果已有完整配置，视为已验证
        if (data.host && data.port && data.username && data.password) {
          setConfigVerified(true);
        }
      } catch {
        message.error('加载邮件配置失败');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [form, message]);

  const handleTestConnection = async () => {
    if (countdown > 0) return;
    const values = form.getFieldsValue();
    const emailConfig = {
      host: values.host,
      port: values.port,
      username: values.username,
      password: values.password,
      from: values.username,
      loginMfaEnabled: values.loginMfaEnabled,
    };
    if (!emailConfig.host || !emailConfig.port || !emailConfig.username || !emailConfig.password) {
      message.error('请先填写完整的 SMTP 配置');
      return;
    }
    try {
      setTesting(true);
      message.loading({ content: '正在发送验证码邮件...', key: 'emailCode' });
      const res = await sendEmailVerificationCode(emailConfig);
      setIdentifier(res.data?.identifier || '');
      message.success({ content: '验证码已发送，请查收邮箱', key: 'emailCode' });
      setCountdown(60);
      setVerifyModalOpen(true);
    } catch (error) {
      message.error({ content: (error instanceof Error ? error.message : '') || '验证码发送失败，请检查 SMTP 配置', key: 'emailCode' });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyCode = async () => {
    const code = verifyCode.trim();
    if (!code) {
      message.error('请输入邮箱验证码');
      return;
    }
    const values = form.getFieldsValue();
    try {
      setEmailVerifying(true);
      await verifyEmailVerificationCode(values.username, code);
      setConfigVerified(true);
      setVerifyCode('');

      // 验证通过后自动保存配置
      setSaving(true);
      try {
        const latestValues = await form.validateFields();
        const emailConfig = latestValues as EmailConfig;
        if (!emailConfig.from) {
          emailConfig.from = emailConfig.username;
        }
        await updateEmailConfig(emailConfig);
        message.success('邮箱验证通过，配置已保存');
        setOriginalConfig(emailConfig);
      } catch {
        message.error('保存失败，请重试');
      } finally {
        setSaving(false);
      }
      setVerifyModalOpen(false);
    } catch (e: unknown) {
      message.error((e instanceof Error ? e.message : '') || '邮箱验证码校验失败');
    } finally {
      setEmailVerifying(false);
    }
  };

  return (
    <div className="email-settings-container">
      <Card
        loading={loading}
        style={{
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '24px 32px',
            background: `linear-gradient(135deg, ${token.colorPrimary}15 0%, ${token.colorPrimary}08 100%)`,
            margin: '-24px -24px 24px',
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          <Space direction="vertical" size={8}>
            <Typography.Title level={3} style={{ margin: 0, fontWeight: 600 }}>
              邮件配置
            </Typography.Title>
            <Typography.Text type="secondary">
              配置 SMTP 邮件服务，用于发送登录验证码、密码重置、系统通知等业务邮件。
            </Typography.Text>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          {/* SMTP 配置 */}
          <Card
            size="small"
            title={
              <Space>
                <MailOutlined style={{ color: token.colorPrimary }} />
                <span>SMTP 配置</span>
                {configVerified && (
                  <Typography.Text style={{ color: token.colorSuccess, fontSize: 12 }}>
                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                    已验证
                  </Typography.Text>
                )}
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.1s both',
            }}
            styles={{ header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
          >
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item name="host" label="邮件服务器地址" tooltip="SMTP 服务器地址">
                    <Input
                      placeholder="smtp.example.com"
                      size="large"
                      prefix={<MailOutlined />}
                      onChange={() => isConfigModified() && setConfigVerified(false)}
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="port" label="邮件服务器端口" tooltip="通常为 587（TLS）或 465（SSL）">
                    <Input
                      placeholder="587"
                      size="large"
                      onChange={() => isConfigModified() && setConfigVerified(false)}
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item name="username" label="邮箱用户名">
                    <Input
                      placeholder="no-reply@example.com"
                      size="large"
                      onChange={() => isConfigModified() && setConfigVerified(false)}
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="password" label="邮箱密码" tooltip="部分邮箱需要使用授权码">
                    <Input.Password
                      placeholder="your-email-password"
                      size="large"
                      onChange={() => isConfigModified() && setConfigVerified(false)}
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                建议使用专门的通知邮箱账号，并开启 SMTP 服务。发件人地址将自动使用邮箱用户名。
              </Typography.Text>

              {/* 测试连接按钮 */}
              <div
                style={{
                  paddingTop: 16,
                  borderTop: `1px solid ${token.colorBorderSecondary}`,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                }}
              >
                <Button
                  icon={<SendOutlined />}
                  onClick={handleTestConnection}
                  loading={testing}
                  disabled={countdown > 0}
                  size="large"
                  style={{ borderRadius: token.borderRadiusLG }}
                >
                  {countdown > 0 ? `${countdown}秒后重试` : '测试连接'}
                </Button>
              </div>
            </Space>
          </Card>

          {/* 安全设置 */}
          <Card
            size="small"
            title="安全设置"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.2s both',
            }}
            styles={{ header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
          >
            <Form.Item
              name="loginMfaEnabled"
              label="开启后台登录邮箱验证码"
              valuePropName="checked"
            >
              <Space>
                <Switch
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                  disabled={!configVerified}
                  style={{
                    background: token.colorPrimary,
                  }}
                  onChange={async (checked) => {
                    setSaving(true);
                    try {
                      const values = await form.validateFields();
                      const emailConfig = values as EmailConfig;
                      emailConfig.loginMfaEnabled = checked;
                      if (!emailConfig.from) {
                        emailConfig.from = emailConfig.username;
                      }
                      await updateEmailConfig(emailConfig);
                      message.success(checked ? '登录邮箱验证码已开启' : '登录邮箱验证码已关闭');
                      setOriginalConfig(emailConfig);
                    } catch {
                      message.error('保存失败');
                    } finally {
                      setSaving(false);
                    }
                  }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {configVerified
                    ? '开启后登录管理后台需要输入邮箱验证码，增强账号安全性。'
                    : '请先测试连接并验证邮箱配置，通过后方可开启此功能。'}
                </Typography.Text>
              </Space>
            </Form.Item>
          </Card>

        </Form>
      </Card>

      {/* 验证码模态框 */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: token.colorPrimary }} />
            <span>验证邮箱配置</span>
          </Space>
        }
        open={verifyModalOpen}
        onCancel={() => {
          setVerifyModalOpen(false);
          setVerifyCode('');
        }}
        footer={null}
        destroyOnHidden
        width={420}
        styles={{
          body: { padding: '24px 24px 16px' },
        }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            验证码已发送至 <Typography.Text strong>{form.getFieldValue('username')}</Typography.Text>，请核对识别码后输入验证码。
          </Typography.Text>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              style={{ width: '80px' }}
              size="large"
              readOnly
              value={identifier || '---'}
              bordered
              className="input-group-addon"
            />
            <Input
              placeholder="请输入验证码"
              size="large"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
            />
          </Space.Compact>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button
              onClick={() => {
                setVerifyModalOpen(false);
                setVerifyCode('');
              }}
              size="large"
              style={{ borderRadius: token.borderRadiusLG }}
            >
              取消
            </Button>
            <Button
              type="primary"
              loading={emailVerifying}
              onClick={handleVerifyCode}
              size="large"
              style={{ borderRadius: token.borderRadiusLG }}
            >
              验证
            </Button>
            <Button
              type="default"
              disabled={countdown > 0}
              onClick={handleTestConnection}
              size="large"
              style={{ borderRadius: token.borderRadiusLG }}
            >
              {countdown > 0 ? `${countdown}秒后重试` : '重新发送'}
            </Button>
          </div>
        </Space>
      </Modal>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .email-settings-container {
          width: 100%;
        }
        .input-group-addon.ant-input {
          text-align: center;
          font-weight: 600;
          color: #1677ff;
          background-color: #ffffff;
          cursor: default;
          border-right: none;
          border-radius: 8px 0 0 8px;
        }
        .input-group-addon.ant-input:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default EmailSettings;
import { MailOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Row, Space, Switch, Typography, theme as antTheme } from 'antd';
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
  const [form] = Form.useForm<EmailConfig & { emailVerifyCode?: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailConfigSnapshot, setEmailConfigSnapshot] = useState('');
  const [emailVerifying, setEmailVerifying] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchEmailConfig();
        form.setFieldsValue(res.data);
        setEmailConfigSnapshot(JSON.stringify(res.data || {}));
      } catch {
        message.error('加载邮件配置失败');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [form, message]);

  const handleSendCode = async () => {
    const values = form.getFieldsValue();
    const emailConfig = {
      host: values.host,
      port: values.port,
      username: values.username,
      password: values.password,
      from: values.from,
      loginMfaEnabled: values.loginMfaEnabled,
    };
    if (!emailConfig.host || !emailConfig.port || !emailConfig.username || !emailConfig.password || !emailConfig.from) {
      message.error('请先填写完整的邮箱配置');
      return;
    }
    try {
      setEmailVerified(false);
      message.loading({ content: '正在发送验证码邮件...', key: 'emailCode' });
      await sendEmailVerificationCode(emailConfig);
      message.success({ content: '验证码已发送，请查收邮箱', key: 'emailCode' });
    } catch (error) {
      message.error({ content: (error instanceof Error ? error.message : '') || '验证码发送失败', key: 'emailCode' });
    }
  };

  const handleVerify = async () => {
    const values = form.getFieldsValue();
    const code = (values.emailVerifyCode || '').trim();
    if (!values.username) {
      message.error('请先填写邮箱用户名');
      return;
    }
    if (!code) {
      message.error('请输入邮箱验证码');
      return;
    }
    try {
      setEmailVerifying(true);
      await verifyEmailVerificationCode(values.username, code);
      setEmailVerified(true);
      message.success('邮箱验证通过，现在可以保存设置');
    } catch (e: unknown) {
      message.error((e instanceof Error ? e.message : '') || '邮箱验证码校验失败');
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleSave = async () => {
    const nextSnapshot = JSON.stringify(form.getFieldsValue() || {});
    if (nextSnapshot !== emailConfigSnapshot && !emailVerified) {
      message.error('邮箱配置已修改，请先发送并验证邮箱验证码后再保存');
      return;
    }
    setSaving(true);
    try {
      const values = await form.validateFields();
      const { emailVerifyCode, ...emailConfig } = values as EmailConfig & { emailVerifyCode?: string };
      await updateEmailConfig(emailConfig);
      message.success('邮件配置保存成功');
      setEmailConfigSnapshot(JSON.stringify(emailConfig));
      setEmailVerified(false);
    } catch {
      message.error('保存失败，请检查表单');
    } finally {
      setSaving(false);
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
              配置 SMTP 邮件服务与登录二次验证，用于发送登录验证码等通知。
            </Typography.Text>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Card
            size="small"
            title={
              <Space>
                <MailOutlined style={{ color: token.colorPrimary }} />
                <span>SMTP 配置</span>
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.1s both',
            }}
            headStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item name="host" label="邮件服务器地址" tooltip="SMTP 服务器地址">
                    <Input
                      placeholder="smtp.example.com"
                      size="large"
                      prefix={<MailOutlined />}
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
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="from" label="发件人邮箱">
                <Input
                  placeholder="no-reply@example.com"
                  size="large"
                  style={{
                    borderRadius: token.borderRadiusLG,
                    transition: 'all 0.3s ease',
                  }}
                />
              </Form.Item>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                建议使用专门的通知邮箱账号，并开启 SMTP 服务。
              </Typography.Text>
            </Space>
          </Card>

          <Card
            size="small"
            title={
              <Space>
                <CheckCircleOutlined style={{ color: token.colorPrimary }} />
                <span>邮箱验证</span>
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.15s both',
            }}
            headStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Row gutter={[16, 0]} align="middle">
                <Col>
                  <Button
                    type="default"
                    icon={<SendOutlined />}
                    onClick={handleSendCode}
                    size="large"
                    style={{
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    发送验证码
                  </Button>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="emailVerifyCode" label="邮箱验证码" style={{ margin: 0 }}>
                    <Input
                      placeholder="123456"
                      size="large"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    loading={emailVerifying}
                    onClick={handleVerify}
                    size="large"
                    style={{
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    验证邮箱
                  </Button>
                </Col>
              </Row>
              {emailVerified && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: `${token.colorSuccess}15`,
                    borderRadius: token.borderRadiusLG,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CheckCircleOutlined style={{ color: token.colorSuccess, marginRight: 8 }} />
                  <Typography.Text style={{ color: token.colorSuccess }}>邮箱验证通过</Typography.Text>
                </div>
              )}
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                修改邮箱配置后，需要先验证邮箱配置是否正确才能保存。
              </Typography.Text>
            </Space>
          </Card>

          <Card
            size="small"
            title="安全设置"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.2s both',
            }}
            headStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
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
                  style={{
                    background: token.colorPrimary,
                  }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  开启后登录管理后台需要输入邮箱验证码，增强账号安全性。
                </Typography.Text>
              </Space>
            </Form.Item>
          </Card>

          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              justifyContent: 'flex-end',
              animation: 'fadeInUp 0.4s ease-out 0.3s both',
            }}
          >
            <Space>
              <Button size="large">取消</Button>
              <Button
                type="primary"
                size="large"
                loading={saving}
                onClick={handleSave}
                style={{
                  borderRadius: token.borderRadiusLG,
                  padding: '0 32px',
                }}
              >
                保存配置
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

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
      `}</style>
    </div>
  );
};

export default EmailSettings;
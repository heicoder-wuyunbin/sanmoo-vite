import { App, Breadcrumb, Button, Card, Form, Input, Space, Switch, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchEmailConfig,
  updateEmailConfig,
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
} from '@/services/blog/settings-api';
import type { EmailConfig } from '@/services/blog/types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const EmailSettings: React.FC = () => {
  const { message } = App.useApp();
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
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '系统配置' }, { title: '邮件配置' }]} />
      </div>
      <Typography.Title level={3} style={{ margin: 0 }}>邮件配置</Typography.Title>
      <Typography.Text type="secondary">配置 SMTP 邮件服务与登录二次验证。</Typography.Text>
      <Card style={{ ...ADMIN_CARD_STYLE }} loading={loading}>
        <Form form={form} layout="vertical">
          <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            用于发送登录验证码等邮件通知，建议使用 SMTP 服务
          </Typography.Text>
          <Form.Item name="host" label="邮件服务器地址" tooltip="SMTP 服务器地址">
            <Input placeholder="例如: smtp.example.com" />
          </Form.Item>
          <Form.Item name="port" label="邮件服务器端口" tooltip="通常为 587（TLS）或 465（SSL）">
            <Input placeholder="例如: 587" />
          </Form.Item>
          <Form.Item name="username" label="邮箱用户名">
            <Input placeholder="例如: no-reply@example.com" />
          </Form.Item>
          <Form.Item name="password" label="邮箱密码" tooltip="部分邮箱需要使用授权码">
            <Input.Password placeholder="例如: your-email-password" />
          </Form.Item>
          <Form.Item name="from" label="发件人邮箱">
            <Input placeholder="例如: no-reply@example.com" />
          </Form.Item>
          <Form.Item name="loginMfaEnabled" label="开启后台登录邮箱验证码" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="default" onClick={handleSendCode}>发送验证码</Button>
          <Form.Item name="emailVerifyCode" label="邮箱验证码" tooltip="请输入你邮箱收到的 6 位验证码" style={{ marginTop: 16 }}>
            <Space>
              <Input placeholder="例如: 12ab34" style={{ width: 120 }} />
              <Button type="primary" loading={emailVerifying} onClick={handleVerify}>验证邮箱</Button>
            </Space>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={saving} onClick={handleSave}>
              保存邮件配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default EmailSettings;

import { App, Button, Card, Form, Input, Space, Switch, Typography } from 'antd';
import React, { useState } from 'react';
import { sendEmailVerificationCode, verifyEmailVerificationCode } from '@/services/blog/api';
import type { SettingsTabProps } from './types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const EmailConfigTab: React.FC<SettingsTabProps> = ({ form, saveConfig, savingConfig }) => {
  const { message } = App.useApp();
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailConfigSnapshot, setEmailConfigSnapshot] = useState('');
  const [emailVerifying, setEmailVerifying] = useState(false);

  const handleSendCode = async () => {
    const emailConfig = form.getFieldValue('emailConfig');
    if (!emailConfig?.host || !emailConfig?.port || !emailConfig?.username || !emailConfig?.password || !emailConfig?.from) {
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
    const emailConfig = form.getFieldValue('emailConfig');
    const code = (form.getFieldValue('emailVerifyCode') || '').trim();
    if (!emailConfig?.username) { message.error('请先填写邮箱用户名'); return; }
    if (!code) { message.error('请输入邮箱验证码'); return; }
    try {
      setEmailVerifying(true);
      await verifyEmailVerificationCode(emailConfig.username, code);
      setEmailVerified(true);
      message.success('邮箱验证通过，现在可以保存设置');
    } catch (e: unknown) {
      message.error((e instanceof Error ? e.message : '') || '邮箱验证码校验失败');
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleSave = () => {
    const nextSnapshot = JSON.stringify(form.getFieldValue('emailConfig') || {});
    if (nextSnapshot !== emailConfigSnapshot && !emailVerified) {
      message.error('邮箱配置已修改，请先发送并验证邮箱验证码后再保存');
      return;
    }
    saveConfig('email', ['emailConfig']);
    setEmailConfigSnapshot(nextSnapshot);
    setEmailVerified(false);
  };

  return (
    <Card style={{ ...ADMIN_CARD_STYLE, marginBottom: 16 }}>
      <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        用于发送登录验证码等邮件通知，建议使用 SMTP 服务
      </Typography.Text>
      <Form.Item name={['emailConfig', 'host']} label="邮件服务器地址" tooltip="SMTP 服务器地址">
        <Input placeholder="例如: smtp.example.com" />
      </Form.Item>
      <Form.Item name={['emailConfig', 'port']} label="邮件服务器端口" tooltip="通常为 587（TLS）或 465（SSL）">
        <Input placeholder="例如: 587" />
      </Form.Item>
      <Form.Item name={['emailConfig', 'username']} label="邮箱用户名"><Input placeholder="例如: no-reply@example.com" /></Form.Item>
      <Form.Item name={['emailConfig', 'password']} label="邮箱密码" tooltip="部分邮箱需要使用授权码">
        <Input.Password placeholder="例如: your-email-password" />
      </Form.Item>
      <Form.Item name={['emailConfig', 'from']} label="发件人邮箱"><Input placeholder="例如: no-reply@example.com" /></Form.Item>
      <Form.Item name={['emailConfig', 'loginMfaEnabled']} label="开启后台登录邮箱验证码" valuePropName="checked">
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
        <Button type="primary" loading={savingConfig === 'email'} onClick={handleSave}>
          保存邮件配置
        </Button>
      </Form.Item>
    </Card>
  );
};

export default EmailConfigTab;


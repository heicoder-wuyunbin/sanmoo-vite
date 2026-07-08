import { Button, Card, Form, Input, Typography } from 'antd';
import { App } from 'antd';
import React, { useState } from 'react';
import { updateSettings } from '@/services/blog/api';
import type { SettingsTabProps } from './types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const PrivacyPolicyTab: React.FC<SettingsTabProps> = ({ form }) => {
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const policyValue = Form.useWatch(['coreConfig', 'privacyPolicy'], form);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        coreConfig: {
          privacyPolicy: policyValue || '',
        },
      } as any);
      message.success('隐私政策保存成功');
    } catch {
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ ...ADMIN_CARD_STYLE, marginBottom: 16 }}>
      <Typography.Title level={4}>隐私政策</Typography.Title>
      <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        在此编辑小程序隐私政策内容，支持 Markdown 格式
      </Typography.Text>
      <Form.Item name={['coreConfig', 'privacyPolicy']} label="隐私政策内容">
        <Input.TextArea rows={12} placeholder="请输入隐私政策内容..." />
      </Form.Item>
      <Form.Item>
        <Button type="primary" loading={saving} onClick={handleSave}>
          保存隐私政策
        </Button>
      </Form.Item>
    </Card>
  );
};

export default PrivacyPolicyTab;

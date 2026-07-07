import { App, Breadcrumb, Button, Card, Form, Input, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPrivacyConfig, updatePrivacyConfig } from '@/services/blog/settings-api';
import type { PrivacyConfig } from '@/services/blog/types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const PrivacySettings: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<PrivacyConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchPrivacyConfig();
        form.setFieldsValue(res.data);
      } catch {
        message.error('加载隐私政策配置失败');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [form, message]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      await updatePrivacyConfig(values);
      message.success('隐私政策保存成功');
    } catch {
      message.error('保存失败，请检查表单');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '系统配置' }, { title: '隐私政策' }]} />
      </div>
      <Typography.Title level={3} style={{ margin: 0 }}>隐私政策</Typography.Title>
      <Typography.Text type="secondary">配置博客隐私政策内容。</Typography.Text>
      <Card style={{ ...ADMIN_CARD_STYLE }} loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item name="privacyPolicy" label="隐私政策内容">
            <Input.TextArea rows={12} placeholder="请输入隐私政策内容..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={saving} onClick={handleSave}>
              保存隐私政策
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default PrivacySettings;

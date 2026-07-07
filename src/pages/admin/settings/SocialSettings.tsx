import { App, Breadcrumb, Button, Card, Form, Input, Space, Switch, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSocialConfig, updateSocialConfig } from '@/services/blog/settings-api';
import type { SocialConfig } from '@/services/blog/types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const SocialSettings: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<SocialConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchSocialConfig();
        form.setFieldsValue(res.data);
      } catch {
        message.error('加载社交链接配置失败');
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
      await updateSocialConfig(values);
      message.success('社交链接保存成功');
    } catch {
      message.error('保存失败，请检查表单');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '系统配置' }, { title: '社交链接' }]} />
      </div>
      <Typography.Title level={3} style={{ margin: 0 }}>社交链接</Typography.Title>
      <Typography.Text type="secondary">配置博客社交账号链接与显示开关。</Typography.Text>
      <Card style={{ ...ADMIN_CARD_STYLE }} loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item name="githubHome" label="GitHub 首页">
            <Input />
          </Form.Item>
          <Form.Item name="csdnHome" label="CSDN 首页">
            <Input />
          </Form.Item>
          <Form.Item name="giteeHome" label="Gitee 首页">
            <Input />
          </Form.Item>
          <Form.Item name="zhihuHome" label="知乎首页">
            <Input />
          </Form.Item>
          <Space size={24} wrap>
            {(['github', 'csdn', 'gitee', 'zhihu'] as const).map((key) => (
              <Form.Item
                key={key}
                name={`${key}Show`}
                label={`显示 ${key[0].toUpperCase() + key.slice(1)}`}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            ))}
          </Space>
          <Form.Item>
            <Button type="primary" loading={saving} onClick={handleSave}>
              保存社交链接配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default SocialSettings;

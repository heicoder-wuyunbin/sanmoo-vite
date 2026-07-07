import { App, Breadcrumb, Button, Card, Form, Input, Select, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStorageConfig, updateStorageConfig } from '@/services/blog/settings-api';
import type { StorageConfig } from '@/services/blog/types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const StorageSettings: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<StorageConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchStorageConfig();
        form.setFieldsValue(res.data);
      } catch {
        message.error('加载存储配置失败');
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
      await updateStorageConfig(values);
      message.success('存储配置保存成功');
    } catch {
      message.error('保存失败，请检查表单');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '系统配置' }, { title: '存储配置' }]} />
      </div>
      <Typography.Title level={3} style={{ margin: 0 }}>存储配置</Typography.Title>
      <Typography.Text type="secondary">配置文件上传存储策略与相关参数。</Typography.Text>
      <Card style={{ ...ADMIN_CARD_STYLE }} loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item name="uploadStrategy" label="上传策略">
            <Select
              options={[
                { label: '本地', value: 'LOCAL' },
                { label: '七牛', value: 'QINIU' },
                { label: '阿里云', value: 'ALIYUN' },
              ]}
            />
          </Form.Item>
          <Form.Item name="uploadLocalDir" label="本地上传目录">
            <Input />
          </Form.Item>
          <Form.Item name="uploadLocalUrlPrefix" label="本地 URL 前缀">
            <Input />
          </Form.Item>
          <Form.Item name="uploadQiniuBucket" label="七牛 Bucket">
            <Input />
          </Form.Item>
          <Form.Item name="uploadQiniuDomain" label="七牛域名">
            <Input />
          </Form.Item>
          <Form.Item name="uploadAliyunEndpoint" label="阿里云 Endpoint">
            <Input />
          </Form.Item>
          <Form.Item name="uploadAliyunBucket" label="阿里云 Bucket">
            <Input />
          </Form.Item>
          <Form.Item name="uploadAliyunDomain" label="阿里云域名">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={saving} onClick={handleSave}>
              保存存储配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default StorageSettings;

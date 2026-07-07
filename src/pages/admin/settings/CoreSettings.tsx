import { LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import {
  App,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Form,
  Input,
  Space,
  Switch,
  Typography,
  Upload,
  theme as antTheme,
  type UploadFile,
  type UploadProps,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadAdminFile } from '@/services/blog/api';
import { fetchCoreConfig, updateCoreConfig } from '@/services/blog/settings-api';
import type { CoreConfig } from '@/services/blog/types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const CoreSettings: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<CoreConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarValue = Form.useWatch('avatar', form);
  const authorValue = Form.useWatch('author', form);

  const uploadLocalUrlPrefix = '/uploads/';

  const avatarPreviewUrl = (() => {
    if (!avatarValue) return null;
    if (/^(https?:)?\/\//.test(avatarValue) || avatarValue.startsWith('data:')) return avatarValue;
    if (avatarValue.startsWith('/')) return avatarValue;
    const prefix = uploadLocalUrlPrefix || '/uploads/';
    return `${prefix.endsWith('/') ? prefix : `${prefix}/`}${avatarValue}`;
  })();

  const avatarFileList: UploadFile[] = avatarPreviewUrl
    ? [{ uid: 'core-avatar', name: 'avatar', status: 'done', url: avatarPreviewUrl }]
    : [];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchCoreConfig();
        form.setFieldsValue(res.data);
      } catch {
        message.error('加载核心配置失败');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [form, message]);

  const onAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setAvatarUploading(true);
    try {
      const result = await uploadAdminFile(file as File);
      const savedPath = result.data.path || result.data.filename;
      form.setFieldValue('avatar', savedPath);
      message.success('头像上传成功');
      onSuccess?.('ok');
    } catch {
      message.error('头像上传失败，请重试');
      onError?.(new Error('头像上传失败'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      await updateCoreConfig(values);
      message.success('核心配置保存成功');
    } catch {
      message.error('保存失败，请检查表单');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '系统配置' }, { title: '核心配置' }]} />
      </div>
      <Typography.Title level={3} style={{ margin: 0 }}>核心配置</Typography.Title>
      <Typography.Text type="secondary">配置博客基本信息、作者信息与头像。</Typography.Text>
      <Card style={{ ...ADMIN_CARD_STYLE }} loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item name="blogName" label="博客名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="作者" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="introduction" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="rssEnabled" label="RSS订阅" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="头像" name="avatar">
            <Upload
              name="file"
              accept="image/*"
              listType="picture-card"
              maxCount={1}
              fileList={avatarFileList}
              customRequest={onAvatarUpload}
              beforeUpload={(file) => {
                if (!file.type.startsWith('image/')) {
                  message.error('只能上传图片文件');
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
              onRemove={() => {
                form.setFieldValue('avatar', '');
                return true;
              }}
            >
              {avatarFileList.length >= 1 ? null : (
                <div>
                  {avatarUploading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>上传头像</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            点击上传即可更换头像
          </Typography.Text>
          <Form.Item label="头像预览">
            <Space>
              <Avatar size={64} src={avatarPreviewUrl || undefined} icon={<UserOutlined />}>
                {authorValue?.trim()?.slice(0, 1)?.toUpperCase() || 'A'}
              </Avatar>
              <Typography.Text type="secondary">
                {avatarPreviewUrl ? '当前使用上传头像' : '未设置头像时显示作者首字'}
              </Typography.Text>
            </Space>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={saving} onClick={handleSave}>
              保存核心配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default CoreSettings;

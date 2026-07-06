import { LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Space,
  Switch,
  Typography,
  Upload,
  type UploadFile,
  type UploadProps,
} from 'antd';
import React, { useState } from 'react';
import { uploadAdminFile } from '@/services/blog/api';
import type { SettingsTabProps } from './types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const CoreConfigTab: React.FC<SettingsTabProps> = ({ form, saveConfig, savingConfig }) => {
  const { message } = App.useApp();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarValue = Form.useWatch(['coreConfig', 'avatar'], form);
  const authorValue = Form.useWatch(['coreConfig', 'author'], form);
  const uploadLocalUrlPrefix = Form.useWatch(['storageConfig', 'uploadLocalUrlPrefix'], form);

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

  const onAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setAvatarUploading(true);
    try {
      const result = await uploadAdminFile(file as File);
      const savedPath = result.data.path || result.data.filename;
      form.setFieldValue(['coreConfig', 'avatar'], savedPath);
      message.success('头像上传成功');
      onSuccess?.('ok');
    } catch {
      message.error('头像上传失败，请重试');
      onError?.(new Error('头像上传失败'));
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <Card style={{ ...ADMIN_CARD_STYLE, marginBottom: 16 }}>
      <Form.Item name={['coreConfig', 'blogName']} label="博客名称" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={['coreConfig', 'author']} label="作者" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={['coreConfig', 'introduction']} label="简介">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name={['coreConfig', 'rssEnabled']} label="RSS订阅" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item label="头像" name={['coreConfig', 'avatar']}>
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
            form.setFieldValue(['coreConfig', 'avatar'], '');
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
        <Button type="primary" loading={savingConfig === 'core'} onClick={() => saveConfig('core', ['coreConfig'])}>
          保存核心配置
        </Button>
      </Form.Item>
    </Card>
  );
};

export default CoreConfigTab;

import { LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Switch,
  Typography,
  Upload,
  theme as antTheme,
  type UploadFile,
  type UploadProps,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { uploadAdminFile } from '@/services/blog/api';
import { fetchCoreConfig, updateCoreConfig } from '@/services/blog/settings-api';
import type { CoreConfig } from '@/services/blog/types';

const CoreSettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const [form] = Form.useForm<CoreConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarValue = Form.useWatch('avatar', form);
  const authorValue = Form.useWatch('author', form);

  const uploadLocalUrlPrefix = '/uploads/';

  const avatarPreviewUrl = (() => {
    const trimmedAvatar = avatarValue?.trim();
    if (!trimmedAvatar) return null;
    if (/^(https?:)?\/\//.test(trimmedAvatar) || trimmedAvatar.startsWith('data:')) return trimmedAvatar;
    if (trimmedAvatar.startsWith('/')) return trimmedAvatar;
    const prefix = uploadLocalUrlPrefix || '/uploads/';
    return `${prefix.endsWith('/') ? prefix : `${prefix}/`}${trimmedAvatar}`;
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
      const savedPath = result.data.url;
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
    <div className="core-settings-container">
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
              核心配置
            </Typography.Title>
            <Typography.Text type="secondary">
              配置博客基本信息、作者信息与头像展示。
            </Typography.Text>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <Card
                size="small"
                title="头像设置"
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  animation: 'fadeInUp 0.4s ease-out 0.1s both',
                }}
                styles={{ header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
              >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar
                      size={100}
                      src={avatarPreviewUrl || undefined}
                      icon={<UserOutlined />}
                      style={{
                        marginBottom: 12,
                        boxShadow: token.boxShadowSecondary,
                        border: `2px solid ${token.colorBorderSecondary}`,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {authorValue?.trim()?.slice(0, 1)?.toUpperCase() || 'A'}
                    </Avatar>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {avatarPreviewUrl ? '已上传头像' : '未设置头像，显示作者首字'}
                    </Typography.Text>
                  </div>

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
                    style={{ animation: 'fadeInUp 0.4s ease-out 0.2s both' }}
                  >
                    {avatarFileList.length >= 1 ? null : (
                      <div style={{ padding: '20px 0' }}>
                        {avatarUploading ? (
                          <LoadingOutlined style={{ fontSize: 24 }} />
                        ) : (
                          <>
                            <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                              点击上传头像
                            </Typography.Text>
                          </>
                        )}
                      </div>
                    )}
                  </Upload>

                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    支持 JPG、PNG 格式，建议尺寸 200x200px
                  </Typography.Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card
                size="small"
                title="基本信息"
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  animation: 'fadeInUp 0.4s ease-out 0.15s both',
                }}
                styles={{ header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
              >
                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                  <Form.Item
                    name="blogName"
                    label="博客名称"
                    rules={[{ required: true, message: '请输入博客名称' }]}
                  >
                    <Input
                      placeholder="请输入博客名称"
                      size="large"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="author"
                    label="作者"
                    rules={[{ required: true, message: '请输入作者名称' }]}
                  >
                    <Input
                      placeholder="请输入作者名称"
                      size="large"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>

                  <Form.Item name="introduction" label="简介">
                    <Input.TextArea
                      rows={4}
                      placeholder="请输入博客简介，将展示在首页"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="siteUrl"
                    label="站点地址"
                    rules={[{ type: 'url', message: '请输入有效的 URL 地址' }]}
                  >
                    <Input
                      placeholder="https://example.com"
                      size="large"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="rssEnabled"
                    label="RSS 订阅"
                    valuePropName="checked"
                    rules={[{ required: true }]}
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
                        开启后将生成 RSS 订阅源，方便读者订阅博客更新
                      </Typography.Text>
                    </Space>
                  </Form.Item>
                </Space>
              </Card>
            </Col>
          </Row>

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
        .core-settings-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CoreSettings;

import { CloudOutlined, CloudServerOutlined, DatabaseOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Row, Select, Space, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useState } from 'react';
import { fetchStorageConfig, updateStorageConfig } from '@/services/blog/settings-api';
import type { StorageConfig } from '@/services/blog/types';

const StorageSettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const [form] = Form.useForm<StorageConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const uploadStrategy = Form.useWatch('uploadStrategy', form);

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

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'LOCAL':
        return <DatabaseOutlined />;
      case 'QINIU':
        return <CloudOutlined />;
      case 'ALIYUN':
        return <CloudServerOutlined />;
      default:
        return <DatabaseOutlined />;
    }
  };

  return (
    <div className="storage-settings-container">
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
              存储配置
            </Typography.Title>
            <Typography.Text type="secondary">
              配置文件上传存储策略与相关参数，支持本地、七牛云、阿里云等多种存储方式。
            </Typography.Text>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card
                size="small"
                title="上传策略"
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  animation: 'fadeInUp 0.4s ease-out 0.1s both',
                }}
                headStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
              >
                <Form.Item
                  name="uploadStrategy"
                  label="选择存储方式"
                  rules={[{ required: true, message: '请选择上传策略' }]}
                >
                  <Select
                    options={[
                      { label: '本地存储', value: 'LOCAL', icon: <DatabaseOutlined /> },
                      { label: '七牛云', value: 'QINIU', icon: <CloudOutlined /> },
                      { label: '阿里云 OSS', value: 'ALIYUN', icon: <CloudServerOutlined /> },
                    ]}
                    size="large"
                    style={{
                      borderRadius: token.borderRadiusLG,
                      transition: 'all 0.3s ease',
                    }}
                    suffixIcon={getStrategyIcon(uploadStrategy || 'LOCAL')}
                  />
                </Form.Item>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  当前选择：
                  <Typography.Text strong>
                    {uploadStrategy === 'LOCAL'
                      ? '本地存储'
                      : uploadStrategy === 'QINIU'
                        ? '七牛云'
                        : '阿里云 OSS'}
                  </Typography.Text>
                </Typography.Text>
              </Card>
            </Col>

            <Col xs={24} md={16}>
              <Card
                size="small"
                title={
                  <Space>
                    {getStrategyIcon(uploadStrategy || 'LOCAL')}
                    <span>配置详情</span>
                  </Space>
                }
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  animation: 'fadeInUp 0.4s ease-out 0.15s both',
                  background: `${token.colorBgContainer}`,
                }}
                headStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
              >
                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                  {uploadStrategy === 'LOCAL' && (
                    <>
                      <Form.Item name="uploadLocalDir" label="本地上传目录">
                        <Input
                          placeholder="/uploads"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadLocalUrlPrefix" label="本地 URL 前缀">
                        <Input
                          placeholder="/uploads/"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        文件将存储在服务器本地目录，适用于开发环境或小规模部署。
                      </Typography.Text>
                    </>
                  )}

                  {uploadStrategy === 'QINIU' && (
                    <>
                      <Form.Item name="uploadQiniuBucket" label="七牛 Bucket">
                        <Input
                          placeholder="请输入七牛 Bucket 名称"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadQiniuRegion" label="七牛地区">
                        <Select
                          options={[
                            { label: '华东 (z0)', value: 'z0' },
                            { label: '华北 (z1)', value: 'z1' },
                            { label: '华南 (z2)', value: 'z2' },
                            { label: '北美 (na0)', value: 'na0' },
                            { label: '东南亚 (as0)', value: 'as0' },
                          ]}
                          placeholder="请选择七牛云存储地区"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadQiniuDomain" label="七牛域名">
                        <Input
                          placeholder="https://xxx.bkt.clouddn.com"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadQiniuAccessKey" label="七牛 AccessKey">
                        <Input
                          placeholder="请输入七牛 AccessKey"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadQiniuSecretKey" label="七牛 SecretKey">
                        <Input.Password
                          placeholder="请输入七牛 SecretKey"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        需要在七牛云控制台创建 Bucket 并配置域名。
                      </Typography.Text>
                    </>
                  )}

                  {uploadStrategy === 'ALIYUN' && (
                    <>
                      <Form.Item name="uploadAliyunEndpoint" label="阿里云 Endpoint">
                        <Input
                          placeholder="oss-cn-hangzhou.aliyuncs.com"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadAliyunBucket" label="阿里云 Bucket">
                        <Input
                          placeholder="请输入阿里云 Bucket 名称"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadAliyunDomain" label="阿里云域名">
                        <Input
                          placeholder="https://xxx.oss-cn-hangzhou.aliyuncs.com"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadAliyunAccessKey" label="阿里云 AccessKey">
                        <Input
                          placeholder="请输入阿里云 AccessKey"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="uploadAliyunSecretKey" label="阿里云 SecretKey">
                        <Input.Password
                          placeholder="请输入阿里云 SecretKey"
                          size="large"
                          style={{
                            borderRadius: token.borderRadiusLG,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Form.Item>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        需要在阿里云 OSS 控制台创建 Bucket 并配置跨域访问。
                      </Typography.Text>
                    </>
                  )}
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
        .storage-settings-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default StorageSettings;
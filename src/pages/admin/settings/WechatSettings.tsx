import { WechatOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Row, Space, Switch, Tag, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useState } from 'react';
import { fetchWechatConfig, updateWechatConfig } from '@/services/blog/settings-api';
import type { WechatConfig } from '@/services/blog/types';

const WechatSettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const [form] = Form.useForm<WechatConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isProd = Form.useWatch('wxEnvMode', form);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchWechatConfig();
        const data = { ...res.data, wxEnvMode: !!res.data.wxEnvMode };
        form.setFieldsValue(data);
      } catch {
        message.error('加载微信配置失败');
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
      await updateWechatConfig({
        ...values,
        wxEnvMode: values.wxEnvMode ? 1 : 0,
      } as unknown as WechatConfig);
      message.success('微信配置保存成功');
    } catch {
      message.error('保存失败，请检查表单');
    } finally {
      setSaving(false);
    }
  };

  const handleEnvToggle = async (checked: boolean) => {
    form.setFieldsValue({ wxEnvMode: checked });
    try {
      const values = form.getFieldsValue();
      await updateWechatConfig({
        ...values,
        wxEnvMode: checked ? 1 : 0,
      } as unknown as WechatConfig);
      message.success(checked ? '已切换至生产环境' : '已切换至开发环境');
    } catch {
      message.error('切换环境失败');
      form.setFieldsValue({ wxEnvMode: !checked });
    }
  };

  return (
    <div className="wechat-settings-container">
      <Card
        loading={loading}
        style={{
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
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
              微信小程序配置
            </Typography.Title>
            <Typography.Text type="secondary">
              配置微信小程序的 AppID 和 Secret，支持开发/生产环境独立配置与一键切换。
            </Typography.Text>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          {/* 环境模式切换 */}
          <Card
            size="small"
            title={
              <Space>
                <WechatOutlined style={{ color: token.colorPrimary }} />
                <span>环境模式</span>
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              marginBottom: 24,
              animation: 'fadeInUp 0.4s ease-out 0.1s both',
            }}
            styles={{ header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
          >
            <Row align="middle" gutter={24}>
              <Col>
                <Tag color={isProd ? 'red' : 'green'} style={{ fontSize: 13, padding: '4px 12px' }}>
                  {isProd ? '生产环境' : '开发环境'}
                </Tag>
              </Col>
              <Col>
                <Form.Item name="wxEnvMode" label="当前生效环境" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch
                    checkedChildren="生产"
                    unCheckedChildren="开发"
                    onChange={handleEnvToggle}
                  />
                </Form.Item>
              </Col>
              <Col flex="auto">
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {isProd
                    ? '当前使用生产环境 AppID/Secret，适用于正式上线的小程序'
                    : '当前使用开发环境 AppID/Secret，适用于开发调试阶段'}
                </Typography.Text>
              </Col>
            </Row>
          </Card>

          {/* 开发环境 + 生产环境并排 */}
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card
                size="small"
                title={
                  <Space>
                    <span style={{ color: '#52c41a' }}>开发环境</span>
                    {!isProd && <Tag color="green" style={{ fontSize: 11 }}>当前生效</Tag>}
                  </Space>
                }
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  animation: 'fadeInUp 0.4s ease-out 0.15s both',
                }}
                styles={{ header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
              >
                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                  <Form.Item
                    name="wxDevAppId"
                    label="AppID"
                    tooltip="微信开放平台获取的开发环境小程序 AppID"
                    rules={[{ required: true, message: '请输入开发环境 AppID' }]}
                  >
                    <Input
                      placeholder="wx..."
                      size="large"
                      prefix={<WechatOutlined />}
                      style={{ borderRadius: token.borderRadiusLG }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="wxDevAppSecret"
                    label="AppSecret"
                    tooltip="微信开放平台获取的开发环境小程序 Secret"
                    rules={[{ required: true, message: '请输入开发环境 Secret' }]}
                  >
                    <Input.Password
                      placeholder="请输入开发环境 Secret"
                      size="large"
                      style={{ borderRadius: token.borderRadiusLG }}
                    />
                  </Form.Item>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                size="small"
                title={
                  <Space>
                    <span style={{ color: '#ff4d4f' }}>生产环境</span>
                    {isProd && <Tag color="red" style={{ fontSize: 11 }}>当前生效</Tag>}
                  </Space>
                }
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  animation: 'fadeInUp 0.4s ease-out 0.2s both',
                }}
                styles={{ header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
              >
                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                  <Form.Item
                    name="wxProdAppId"
                    label="AppID"
                    tooltip="微信开放平台获取的生产环境小程序 AppID"
                    rules={[{ required: true, message: '请输入生产环境 AppID' }]}
                  >
                    <Input
                      placeholder="wx..."
                      size="large"
                      prefix={<WechatOutlined />}
                      style={{ borderRadius: token.borderRadiusLG }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="wxProdAppSecret"
                    label="AppSecret"
                    tooltip="微信开放平台获取的生产环境小程序 Secret"
                    rules={[{ required: true, message: '请输入生产环境 Secret' }]}
                  >
                    <Input.Password
                      placeholder="请输入生产环境 Secret"
                      size="large"
                      style={{ borderRadius: token.borderRadiusLG }}
                    />
                  </Form.Item>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* 操作按钮 */}
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
              <Button size="large" onClick={() => form.resetFields()}>
                重置
              </Button>
              <Button
                type="primary"
                size="large"
                loading={saving}
                onClick={handleSave}
                style={{ borderRadius: token.borderRadiusLG, padding: '0 32px' }}
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
        .wechat-settings-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default WechatSettings;
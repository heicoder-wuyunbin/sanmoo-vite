import { GithubOutlined, GlobalOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Row, Space, Switch, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useState } from 'react';
import { fetchSocialConfig, updateSocialConfig } from '@/services/blog/settings-api';
import type { SocialConfig } from '@/services/blog/types';

const SOCIAL_ITEMS = [
  { key: 'github', label: 'GitHub', icon: <GithubOutlined />, placeholder: 'https://github.com/xxx' },
  { key: 'csdn', label: 'CSDN', icon: <GlobalOutlined />, placeholder: 'https://blog.csdn.net/xxx' },
  { key: 'gitee', label: 'Gitee', icon: <UserOutlined />, placeholder: 'https://gitee.com/xxx' },
  { key: 'zhihu', label: '知乎', icon: <GlobalOutlined />, placeholder: 'https://www.zhihu.com/people/xxx' },
];

const SocialSettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
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
    <div className="social-settings-container">
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
              社交链接
            </Typography.Title>
            <Typography.Text type="secondary">
              配置博客社交账号链接与显示开关，让读者更方便地关注您的社交动态。
            </Typography.Text>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={[24, 24]}>
            {SOCIAL_ITEMS.map((item, index) => (
              <Col xs={24} md={12} key={item.key}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <span style={{ color: token.colorPrimary }}>{item.icon}</span>
                      <span>{item.label}</span>
                      <Form.Item
                        name={`${item.key}Show`}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Switch
                          checkedChildren={<CheckCircleOutlined />}
                          unCheckedChildren={null}
                          style={{
                            background: token.colorPrimary,
                          }}
                        />
                      </Form.Item>
                    </Space>
                  }
                  style={{
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusLG,
                    animation: `fadeInUp 0.4s ease-out ${0.1 + index * 0.05}s both`,
                  }}
                  headStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
                >
                  <Form.Item name={`${item.key}Home`} label={`${item.label} 链接`}>
                    <Input
                      placeholder={item.placeholder}
                      size="large"
                      prefix={item.icon}
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Card>
              </Col>
            ))}
          </Row>

          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              justifyContent: 'flex-end',
              animation: 'fadeInUp 0.4s ease-out 0.4s both',
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
        .social-settings-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default SocialSettings;
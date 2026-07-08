import { FileTextOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Space, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useState } from 'react';
import { fetchPrivacyConfig, updatePrivacyConfig } from '@/services/blog/settings-api';
import type { PrivacyConfig } from '@/services/blog/types';

const PrivacySettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
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
    <div className="privacy-settings-container">
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
              隐私政策
            </Typography.Title>
            <Typography.Text type="secondary">
              配置博客隐私政策内容，确保符合相关法律法规要求。
            </Typography.Text>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Card
            size="small"
            title={
              <Space>
                <FileTextOutlined style={{ color: token.colorPrimary }} />
                <span>隐私政策内容</span>
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.1s both',
            }}
            styles={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Form.Item name="privacyPolicy" label="政策内容">
                <Input.TextArea
                  rows={15}
                  placeholder="请输入隐私政策内容...

1. 信息收集：我们会收集您的浏览记录和互动数据，以优化用户体验。

2. 信息使用：收集的信息仅用于网站改进和个性化推荐，不会用于其他目的。

3. 信息保护：我们采用行业标准的安全措施保护您的个人信息。

4. 第三方服务：本网站可能包含第三方服务链接，其隐私政策由第三方负责。"
                  style={{
                    borderRadius: token.borderRadiusLG,
                    transition: 'all 0.3s ease',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    lineHeight: 1.8,
                  }}
                />
              </Form.Item>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                隐私政策将展示在博客的「隐私政策」页面，建议根据实际情况填写完整的隐私声明。
              </Typography.Text>
            </Space>
          </Card>

          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              justifyContent: 'flex-end',
              animation: 'fadeInUp 0.4s ease-out 0.2s both',
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
        .privacy-settings-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default PrivacySettings;

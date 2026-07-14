import { FileTextOutlined, SafetyOutlined, MailOutlined, DatabaseOutlined, UserDeleteOutlined } from '@ant-design/icons';
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
              合规配置
            </Typography.Title>
            <Typography.Text type="secondary">
              配置博客合规信息，包括隐私政策、备案信息、联系方式等，确保符合相关法律法规要求。
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
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Form.Item name="privacyPolicy" label="政策内容">
                <Input.TextArea
                  rows={10}
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

          <Card
            size="small"
            title={
              <Space>
                <SafetyOutlined style={{ color: token.colorPrimary }} />
                <span>备案信息</span>
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              marginTop: 24,
              animation: 'fadeInUp 0.4s ease-out 0.2s both',
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Form.Item name="filingInfo" label="备案信息（JSON格式）">
                <Input.TextArea
                  rows={4}
                  placeholder='{"icpCode": "京ICP备xxxxxxxx号", "filingUrl": "https://beian.miit.gov.cn", "recordType": "个人"}'
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
                备案信息将展示在网站页脚和隐私政策页面，需要填写符合格式的JSON字符串。
              </Typography.Text>
            </Space>
          </Card>

          <Card
            size="small"
            title={
              <Space>
                <MailOutlined style={{ color: token.colorPrimary }} />
                <span>联系方式</span>
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              marginTop: 24,
              animation: 'fadeInUp 0.4s ease-out 0.3s both',
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Form.Item name="contactInfo" label="联系方式（JSON格式）">
                <Input.TextArea
                  rows={4}
                  placeholder='{"email": "contact@example.com", "wechat": "example_wx", "github": "example"}'
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
                联系方式将展示在隐私政策页面的「联系我们」部分，需要填写符合格式的JSON字符串。
              </Typography.Text>
            </Space>
          </Card>

          <Card
            size="small"
            title={
              <Space>
                <DatabaseOutlined style={{ color: token.colorPrimary }} />
                <span>数据保留说明</span>
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              marginTop: 24,
              animation: 'fadeInUp 0.4s ease-out 0.4s both',
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Form.Item name="dataRetentionPolicy" label="数据保留说明">
                <Input.TextArea
                  rows={6}
                  placeholder="访问日志保留30天，错误日志保留90天，文章统计数据保留365天。用户基础信息将长期保留，直到用户主动申请删除。"
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
                数据保留说明将展示在隐私政策页面，说明各类数据的保留期限和处理方式。
              </Typography.Text>
            </Space>
          </Card>

          <Card
            size="small"
            title={
              <Space>
                <UserDeleteOutlined style={{ color: token.colorPrimary }} />
                <span>账号注销说明</span>
              </Space>
            }
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              marginTop: 24,
              animation: 'fadeInUp 0.4s ease-out 0.5s both',
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Form.Item name="accountDeletionGuide" label="账号注销说明">
                <Input.TextArea
                  rows={6}
                  placeholder={'小程序用户可在个人中心页面点击"注销账号"按钮，系统将删除您的所有个人数据，包括用户信息、收藏记录、浏览历史等。注销后无法恢复，请谨慎操作。'}
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
                账号注销说明将展示在隐私政策页面，说明用户如何申请删除账号和个人数据。
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
              animation: 'fadeInUp 0.4s ease-out 0.6s both',
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
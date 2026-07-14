import React, { useEffect, useMemo, useState } from 'react';
import { Card, Space, Typography, theme as antTheme, Spin } from 'antd';
import WebShell from './components/WebShell';
import { fetchWebCompliance } from '@/services/blog/settings-api';
import type { ComplianceInfo, FilingInfo, ContactInfo } from '@/services/blog/types';

const parseJson = <T,>(str: string): T | null => {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
};

const PrivacyPolicyPage: React.FC = () => {
  const { token } = antTheme.useToken();
  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState<ComplianceInfo | null>(null);
  const [filingInfo, setFilingInfo] = useState<FilingInfo | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchWebCompliance();
        setCompliance(res.data);
        if (res.data?.filingInfo) {
          setFilingInfo(parseJson<FilingInfo>(res.data.filingInfo));
        }
        if (res.data?.contactInfo) {
          setContactInfo(parseJson<ContactInfo>(res.data.contactInfo));
        }
      } catch {
        console.warn('获取合规信息失败，使用默认内容');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadow,
      background: token.colorBgContainer,
    }),
    [token],
  );

  if (loading) {
    return (
      <WebShell>
        <Space direction="vertical" size={20} style={{ width: '100%', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </Space>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card
          style={{
            ...cardStyle,
            background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgElevated} 58%, ${token.colorInfoBg} 100%)`,
          }}
          styles={{ body: { padding: 28 } }}
        >
          <Space direction="vertical" size={16} align="center" style={{ width: '100%' }}>
            <Typography.Title
              level={2}
              style={{ margin: 0, textAlign: 'center', color: token.colorText }}
            >
              隐私政策
            </Typography.Title>
            <Typography.Paragraph
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                textAlign: 'center',
                color: token.colorTextSecondary,
                maxWidth: 720,
              }}
            >
              本隐私政策旨在说明本站如何收集、使用、存储和保护您的个人信息。本站为个人备案网站，仅提供原创技术内容发布与阅读服务。
            </Typography.Paragraph>
          </Space>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            一、信息收集
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            本站仅收集必要的访问日志信息，包括但不限于：
          </Typography.Paragraph>
          <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, lineHeight: 2 }}>
            <li>访问时间和访问页面</li>
            <li>IP地址（用于统计和安全目的）</li>
            <li>浏览器类型和操作系统</li>
            <li>访问来源（如搜索引擎、推荐链接）</li>
          </ul>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            二、信息使用
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            收集的信息仅用于以下目的：
          </Typography.Paragraph>
          <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, lineHeight: 2 }}>
            <li>统计网站访问流量和用户行为分析</li>
            <li>优化网站内容和用户体验</li>
            <li>检测和防止恶意访问</li>
            <li>提供更好的技术支持</li>
          </ul>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            三、信息保护
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            我们采取合理的安全措施保护您的信息：
          </Typography.Paragraph>
          <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, lineHeight: 2 }}>
            <li>访问日志存储在安全的服务器上</li>
            <li>定期清理过期日志（保留30天）</li>
            <li>不向第三方分享个人身份信息</li>
            <li>使用HTTPS加密传输数据</li>
          </ul>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            四、数据保留说明
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            {compliance?.dataRetentionPolicy || '访问日志保留30天，错误日志保留90天，文章统计数据保留365天。用户基础信息将长期保留，直到用户主动申请删除。'}
          </Typography.Paragraph>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            五、账号注销说明
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            {compliance?.accountDeletionGuide || '小程序用户可在个人中心页面点击"注销账号"按钮，系统将删除您的所有个人数据，包括用户信息、收藏记录、浏览历史等。注销后无法恢复，请谨慎操作。'}
          </Typography.Paragraph>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            六、Cookie政策
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            本站使用Cookie来改善用户体验：
          </Typography.Paragraph>
          <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, lineHeight: 2 }}>
            <li>记录主题偏好（深色/浅色模式）</li>
            <li>保存登录状态（如果您登录管理后台）</li>
            <li>Cookie仅存储在您的本地浏览器中</li>
            <li>您可以随时清除浏览器Cookie</li>
          </ul>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            七、第三方链接
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            本站可能包含指向第三方网站的链接。我们不对这些网站的隐私政策负责。建议您在访问第三方网站时查看其隐私政策。
          </Typography.Paragraph>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            八、政策更新
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            本隐私政策可能会不定期更新。更新后会在页面上发布新的政策内容，您继续使用本站即表示同意更新后的政策。
          </Typography.Paragraph>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            九、联系我们
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            如果您对本隐私政策有任何疑问或建议，可通过以下方式联系站长：
          </Typography.Paragraph>
          <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, lineHeight: 2 }}>
            {contactInfo?.email && <li>邮箱：{contactInfo.email}</li>}
            {contactInfo?.github && <li>GitHub：<a href={`https://github.com/${contactInfo.github}`} target="_blank" rel="noopener noreferrer" style={{ color: token.colorPrimary }}>{contactInfo.github}</a></li>}
            {contactInfo?.wechat && <li>微信：{contactInfo.wechat}</li>}
            {!contactInfo?.email && !contactInfo?.github && !contactInfo?.wechat && (
              <li>通过网站页脚「联系站长」链接发送邮件</li>
            )}
          </ul>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            我们会在合理时间内回复您的来信。
          </Typography.Paragraph>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
          <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
            十、站点性质声明
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
            本站为个人备案网站，定位为个人原创技术内容发布与知识整理平台，不提供以下服务：
          </Typography.Paragraph>
          <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, lineHeight: 2 }}>
            <li>用户注册与公开发布</li>
            <li>评论社区</li>
            <li>会员付费与交易</li>
            <li>社交关系链</li>
          </ul>
        </Card>

        {filingInfo && (
          <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
            <Typography.Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
              十一、备案信息
            </Typography.Title>
            <Typography.Paragraph style={{ color: token.colorTextSecondary, lineHeight: 1.8 }}>
              本站已完成 ICP 备案：
            </Typography.Paragraph>
            <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, lineHeight: 2 }}>
              {filingInfo.icpCode && (
                <li>
                  ICP 备案号：
                  <a href={filingInfo.filingUrl || 'https://beian.miit.gov.cn/'} target="_blank" rel="noopener noreferrer" style={{ color: token.colorPrimary }}>
                    {filingInfo.icpCode}
                  </a>
                </li>
              )}
              {filingInfo.recordType && <li>备案类型：{filingInfo.recordType}</li>}
            </ul>
          </Card>
        )}

        <Card style={{ ...cardStyle, textAlign: 'center' }} styles={{ body: { padding: 20 } }}>
          <Typography.Text style={{ color: token.colorTextTertiary }}>
            最后更新：2026年7月
          </Typography.Text>
        </Card>
      </Space>
    </WebShell>
  );
};

export default PrivacyPolicyPage;
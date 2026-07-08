import React from 'react';
import { Divider, Layout, Space, Typography, theme as antTheme } from 'antd';
import { FileTextOutlined, MailOutlined, SafetyCertificateOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Footer } = Layout;

type WebFooterProps = {
  blogName: string;
  rssEnabled: boolean;
  contactEmail?: string;
};

const WebFooter: React.FC<WebFooterProps> = ({ blogName, rssEnabled, contactEmail }) => {
  const { token } = antTheme.useToken();

  const linkStyle: React.CSSProperties = {
    color: token.colorTextTertiary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };

  return (
    <Footer
      style={{
        textAlign: 'center',
        background: 'transparent',
        color: token.colorTextSecondary,
        padding: '24px 16px',
        fontSize: 13,
      }}
    >
      <div style={{ marginBottom: 8 }}>
        {blogName} © {new Date().getFullYear()} · 个人原创技术内容站
      </div>

      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, display: 'block', marginBottom: 10 }}
      >
        本站为个人备案网站，专注原创技术内容发布与知识整理
      </Typography.Text>

      <Divider style={{ maxWidth: 360, margin: '0 auto 10px', borderColor: token.colorBorderSecondary }} />

      <Space size={16} style={{ marginBottom: 10 }}>
        <Link to="/privacy-policy" style={linkStyle}>
          <SafetyCertificateOutlined style={{ fontSize: 12 }} />
          隐私政策
        </Link>
        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <FileTextOutlined style={{ fontSize: 12 }} />
          Sitemap
        </a>
        {rssEnabled && (
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            <ShareAltOutlined style={{ fontSize: 12 }} />
            RSS
          </a>
        )}
        {contactEmail ? (
          <a href={`mailto:${contactEmail}`} style={linkStyle}>
            <MailOutlined style={{ fontSize: 12 }} />
            联系站长
          </a>
        ) : null}
      </Space>

      <Divider style={{ maxWidth: 360, margin: '0 auto 10px', borderColor: token.colorBorderSecondary }} />

      <div>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: token.colorTextTertiary, marginRight: 12 }}
        >
          闽ICP备2026004727号-1
        </a>
        <a
          href="http://www.beian.gov.cn/portal/registerSystemInfo"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: token.colorTextTertiary }}
        >
          闽公网安备35020302036974号
        </a>
      </div>
    </Footer>
  );
};

export default WebFooter;

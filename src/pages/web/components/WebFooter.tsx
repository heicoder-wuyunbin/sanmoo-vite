import React from 'react';
import { Divider, Layout, theme as antTheme } from 'antd';
import { FileTextOutlined, ShareAltOutlined } from '@ant-design/icons';

const { Footer } = Layout;

type WebFooterProps = {
  blogName: string;
  rssEnabled: boolean;
};

const WebFooter: React.FC<WebFooterProps> = ({ blogName, rssEnabled }) => {
  const { token } = antTheme.useToken();

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
        {blogName} © {new Date().getFullYear()} · Backend Art · 技术沉淀
      </div>
      <Divider style={{ maxWidth: 320, margin: '0 auto 10px', borderColor: token.colorBorderSecondary }} />
      <div style={{ marginBottom: 12 }}>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: token.colorTextTertiary, marginRight: 16, display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <FileTextOutlined style={{ fontSize: 12 }} />
          Sitemap
        </a>
        {rssEnabled && (
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: token.colorTextTertiary, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <ShareAltOutlined style={{ fontSize: 12 }} />
            RSS
          </a>
        )}
      </div>
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

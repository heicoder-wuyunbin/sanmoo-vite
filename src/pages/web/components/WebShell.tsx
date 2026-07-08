import React, { useEffect, useState } from 'react';
import { Grid, Layout, theme as antTheme } from 'antd';
import { useLayoutStore } from '@/store/useLayoutStore';
import WebHeader from './WebHeader';
import WebSidebar from './WebSidebar';
import WebFooter from './WebFooter';
import SearchModal from './SearchModal';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const CONTAINER_MAX_WIDTH = 1200;

type Props = {
  children: React.ReactNode;
  hideSidebar?: boolean;
};

const WebShell: React.FC<Props> = ({ children, hideSidebar }) => {
  const screens = useBreakpoint();
  const isDesktop = !!screens.lg;
  const { settings, categories, tags, articleCount, loadGlobalData } = useLayoutStore();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const { token } = antTheme.useToken();

  useEffect(() => {
    loadGlobalData();
  }, [loadGlobalData]);

  const blogName = settings?.coreConfig?.blogName || 'Sanmoo Blog';
  const author = settings?.coreConfig?.author || 'Author';
  const introduction =
    settings?.coreConfig?.introduction || '个人原创技术内容发布与知识整理平台';
  const rssEnabled = settings?.coreConfig?.rssEnabled !== false;

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <WebHeader blogName={blogName} onSearchClick={() => setSearchModalVisible(true)} />

      <Layout style={{ maxWidth: CONTAINER_MAX_WIDTH, margin: '16px auto 0', width: '100%', background: 'transparent' }}>
        <Content style={{ paddingRight: isDesktop && !hideSidebar ? 16 : 0 }}>{children}</Content>
        {isDesktop && !hideSidebar ? (
          <WebSidebar
            author={author}
            introduction={introduction}
            articleCount={articleCount || 0}
            categories={categories}
            tags={tags}
          />
        ) : null}
      </Layout>

      <WebFooter
        blogName={blogName}
        rssEnabled={rssEnabled}
        contactEmail={settings?.emailConfig?.from}
      />

      <SearchModal
        visible={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
      />
    </Layout>
  );
};

export default WebShell;

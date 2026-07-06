import React from 'react';
import {
  Avatar,
  Divider,
  Layout,
  Space,
  Tag,
  Typography,
  theme as antTheme,
} from 'antd';
import {
  FileTextOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import CollapsibleTags from './CollapsibleTags';

type TaxonomyItem = {
  id: number;
  name: string;
  articleCount?: number;
};

const { Sider } = Layout;

const SIDEBAR_WIDTH = 300;

type WebSidebarProps = {
  author: string;
  introduction: string;
  articleCount: number;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
};

const WebSidebar: React.FC<WebSidebarProps> = ({
  author,
  introduction,
  articleCount,
  categories,
  tags,
}) => {
  const { token } = antTheme.useToken();

  return (
    <Sider
      width={SIDEBAR_WIDTH}
      style={{
        background: 'transparent',
        position: 'sticky',
        top: 80,
        alignSelf: 'flex-start',
        flex: `0 0 ${SIDEBAR_WIDTH}px`,
      }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%', paddingRight: 16 }}>
        <div
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            padding: 20,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space align="center" size={12}>
              <Avatar
                size={56}
                style={{ background: token.colorPrimary, fontWeight: 700, fontSize: 20 }}
              >
                {Array.from(author)[0]}
              </Avatar>
              <div>
                <Typography.Text strong style={{ fontSize: 15, color: token.colorText }}>
                  {author}
                </Typography.Text>
                <div style={{ color: token.colorTextSecondary, fontSize: 12, marginTop: 4 }}>
                  {introduction}
                </div>
              </div>
            </Space>
            <Divider style={{ margin: '4px 0' }} />
            <Space size={8}>
              <Tag color="blue" icon={<FileTextOutlined />}>
                {articleCount || 0} 篇文章
              </Tag>
              <Tag color="gold" icon={<TagsOutlined />}>
                {tags.length} 个标签
              </Tag>
            </Space>
          </Space>
        </div>

        <CollapsibleTags
          title="分类导航"
          items={categories}
          baseUrl="/categories"
          primaryColor="blue"
          maxVisible={6}
        />
        <CollapsibleTags
          title="标签导航"
          items={tags}
          baseUrl="/tags"
          primaryColor="gold"
          maxVisible={8}
        />
      </Space>
    </Sider>
  );
};

export default WebSidebar;

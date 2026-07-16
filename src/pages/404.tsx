import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Space,
  Tag,
  Typography,
  theme as antTheme,
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import WebShell from './web/components/WebShell';
import { fetchHotArticles, fetchHotSearches, getArticleUrl, type ArticleItem } from '@/services/blog/api';

const NotFound: React.FC = () => {
  const { token } = antTheme.useToken();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const { data: hotArticles } = useQuery<ArticleItem[]>({
    queryKey: ['hotArticles'],
    queryFn: async () => {
      const res = await fetchHotArticles(6);
      return res.data;
    },
  });

  const { data: hotSearches } = useQuery<string[]>({
    queryKey: ['hotSearches'],
    queryFn: async () => {
      const res = await fetchHotSearches();
      return res.data;
    },
  });

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadow,
      background: token.colorBgContainer,
    }),
    [token],
  );

  const handleSearch = () => {
    if (!searchText.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(searchText.trim())}`);
  };

  return (
    <WebShell hideSidebar>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card
          style={{
            ...cardStyle,
            background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgElevated} 55%, ${token.colorWarningBg} 100%)`,
            overflow: 'hidden',
            position: 'relative',
          }}
          styles={{ body: { padding: 32, position: 'relative', zIndex: 1 } }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -40,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${token.colorPrimary}18 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -80,
              left: -60,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${token.colorWarning}15 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <Space direction="vertical" size={20} align="center" style={{ width: '100%' }}>
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontSize: 112,
                  fontWeight: 800,
                  letterSpacing: '-4px',
                  background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorWarning} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  userSelect: 'none',
                  fontFamily: 'inherit',
                }}
              >
                404
              </span>
            </div>

            <Tag
              color="blue"
              style={{
                borderRadius: 999,
                paddingInline: 14,
                fontSize: 12,
                fontWeight: 600,
                background: `${token.colorPrimary}15`,
                borderColor: token.colorPrimary,
                color: token.colorPrimary,
              }}
            >
              Page Not Found
            </Tag>

            <Typography.Title
              level={2}
              style={{ margin: 0, textAlign: 'center', color: token.colorTextHeading }}
            >
              抱歉，页面走丢了
            </Typography.Title>

            <Typography.Paragraph
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                textAlign: 'center',
                color: token.colorTextSecondary,
                maxWidth: 520,
                margin: 0,
              }}
            >
              您访问的页面可能已被移除、重命名或暂时不可用。
              试试搜索功能，或者返回首页继续浏览吧。
            </Typography.Paragraph>

            <div style={{ width: '100%', maxWidth: 520, marginTop: 4 }}>
              <Input.Search
                placeholder="搜索文章..."
                allowClear
                enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                onPressEnter={handleSearch}
                style={{ width: '100%' }}
              />
              {hotSearches && hotSearches.length > 0 && (
                <Space wrap size={8} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    热门搜索：
                  </Typography.Text>
                  {hotSearches.slice(0, 5).map((keyword, index) => (
                    <Tag
                      key={index}
                      onClick={() => navigate(`/search?keyword=${encodeURIComponent(keyword)}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {keyword}
                    </Tag>
                  ))}
                </Space>
              )}
            </div>

            <Space size={12} style={{ marginTop: 4 }}>
              <Link to="/">
                <Button type="primary" size="large" icon={<HomeOutlined />}>
                  返回首页
                </Button>
              </Link>
              <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                返回上页
              </Button>
            </Space>
          </Space>
        </Card>

        {hotArticles && hotArticles.length > 0 && (
          <Card style={cardStyle} styles={{ body: { padding: 22 } }}>
            <Typography.Text
              strong
              style={{
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
                color: token.colorTextHeading,
              }}
            >
              <ThunderboltOutlined style={{ color: token.colorWarning }} />
              热门文章
            </Typography.Text>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {hotArticles.map((item, index) => (
                <Link
                  key={item.id}
                  to={getArticleUrl(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: token.borderRadiusSM,
                    backgroundColor: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = token.colorPrimary;
                    (e.currentTarget as HTMLElement).style.boxShadow = token.boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = token.colorBorderSecondary;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background:
                        index < 3
                          ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorWarning} 100%)`
                          : token.colorFillSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      color: index < 3 ? '#fff' : token.colorTextSecondary,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text
                      style={{
                        color: token.colorText,
                        fontWeight: 500,
                        fontSize: 14,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.title}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                      阅读 {item.readNum ?? 0}
                    </Typography.Text>
                  </div>
                </Link>
              ))}
            </Space>
          </Card>
        )}
      </Space>
    </WebShell>
  );
};

export default NotFound;

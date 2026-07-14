import { AppstoreOutlined, BookOutlined, TagOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Pagination,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  theme as antTheme,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import ArticleCard from './components/ArticleCard';
import { fetchArticles, fetchWebTopics } from '@/services/blog/api';
import WebShell from '@/pages/web/components/WebShell';
import { useQuery } from '@tanstack/react-query';
import { useLayoutStore } from '@/store/useLayoutStore';
import type { TopicItem } from '@/services/blog/types';

const HomePage: React.FC = () => {
  const { token } = antTheme.useToken();
  const { message } = App.useApp();
  const { settings } = useLayoutStore();
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadowSecondary,
      background: token.colorBgContainer,
    }),
    [token],
  );

  const helperTextStyle: React.CSSProperties = useMemo(
    () => ({
      color: token.colorTextSecondary,
    }),
    [token],
  );

  const heroStyle: React.CSSProperties = useMemo(
    () => ({
      ...cardStyle,
      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgElevated} 55%, ${token.colorWarningBg} 100%)`,
    }),
    [cardStyle, token],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', page, size],
    queryFn: async () => {
      const res = await fetchArticles({ page, size });
      return res.data;
    },
  });

  const { data: topicsData } = useQuery({
    queryKey: ['homeTopics'],
    queryFn: async () => {
      const res = await fetchWebTopics({ page: 1, size: 4 });
      return res.data;
    },
  });
  const featuredTopics = useMemo(() => topicsData?.list || [], [topicsData]);

  useEffect(() => {
    if (error) {
      message.error('加载文章列表失败');
    }
  }, [error, message]);

  const articles = useMemo(() => data?.list || [], [data?.list]);
  const total = data?.total || 0;
  const blogName = settings?.coreConfig?.blogName || 'Sanmoo Blog';
  const introduction =
    settings?.coreConfig?.introduction || '个人原创技术内容发布与知识整理平台';

  const featuredArticle = useMemo(() => {
    if (articles.length === 0) {
      return undefined;
    }
    return articles.find((item) => item.isTop) || articles[0];
  }, [articles]);

  const remainingArticles = useMemo(() => {
    if (!featuredArticle) {
      return articles;
    }
    return articles.filter((item) => item.id !== featuredArticle.id);
  }, [articles, featuredArticle]);

  const spotlightArticles = remainingArticles.slice(0, 2);
  const feedArticles = remainingArticles.slice(2);

  return (
    <WebShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card
          style={heroStyle}
          styles={{ body: { padding: 32 } }}
        >
          <div style={{ maxWidth: 720 }}>
            <Space direction="vertical" size={20}>
              <div>
                <Tag
                  color="blue"
                  style={{
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: `${token.colorPrimary}15`,
                    borderColor: token.colorPrimary,
                    color: token.colorPrimary,
                  }}
                >
                  Backend Art · 个人原创
                </Tag>
              </div>

              <div>
                <Typography.Title
                  level={1}
                  style={{
                    margin: 0,
                    color: token.colorTextHeading,
                    fontSize: 40,
                    lineHeight: 1.15,
                    fontWeight: 700,
                    textWrap: 'balance',
                  }}
                >
                  {blogName}
                </Typography.Title>
                <Typography.Paragraph
                  style={{
                    margin: '16px 0 0',
                    color: token.colorTextSecondary,
                    fontSize: 16,
                    lineHeight: 1.7,
                  }}
                >
                  {introduction}
                </Typography.Paragraph>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: token.colorBgTextHover,
                    borderRadius: 8,
                  }}
                >
                  <TagOutlined style={{ fontSize: 14, color: token.colorTextTertiary }} />
                  <Typography.Text style={{ color: token.colorTextSecondary }}>
                    共 {total} 篇文章
                  </Typography.Text>
                </div>
              </div>

              <Space size={12}>
                <Link to="/archives">
                  <Button type="primary" size="large">
                    浏览全部文章
                  </Button>
                </Link>
                <Link to="/tags">
                  <Button size="large">探索标签</Button>
                </Link>
              </Space>
            </Space>
          </div>
        </Card>

        {featuredTopics.length > 0 && (
          <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
                    <AppstoreOutlined style={{ marginRight: 8 }} />
                    专题精选
                  </Typography.Title>
                  <Typography.Text style={helperTextStyle}>
                    体系化阅读，从入门到深入
                  </Typography.Text>
                </div>
                <Link to="/topics">
                  <Button type="link">查看全部专题</Button>
                </Link>
              </div>
              <Row gutter={[16, 16]}>
                {featuredTopics.map((topic: TopicItem) => (
                  <Col key={topic.id} xs={24} sm={12} md={6}>
                    <Link to={`/topics/${topic.id}`} style={{ textDecoration: 'none' }}>
                      <Card
                        style={{
                          ...cardStyle,
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                        styles={{ body: { padding: 16 } }}
                        hoverable
                      >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Typography.Text strong style={{ fontSize: 15 }}>
                            <BookOutlined style={{ marginRight: 6, color: token.colorPrimary }} />
                            {topic.title}
                          </Typography.Text>
                          {topic.description && (
                            <Typography.Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{ margin: 0, fontSize: 13, color: token.colorTextSecondary }}
                            >
                              {topic.description}
                            </Typography.Paragraph>
                          )}
                          <Tag color="blue" style={{ borderRadius: 999, paddingInline: 10 }}>
                            {topic.articleCount} 篇文章
                          </Tag>
                        </Space>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Space>
          </Card>
        )}

        <Spin spinning={isLoading}>
          {featuredArticle ? (
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <ArticleCard article={featuredArticle} style="featured" />

              {spotlightArticles.length > 0 ? (
                <div>
                  <Space
                    align="center"
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <Typography.Title
                        level={3}
                        style={{ margin: 0, color: token.colorTextHeading }}
                      >
                        推荐延伸
                      </Typography.Title>
                      <Typography.Text style={helperTextStyle}>
                        适合继续深入阅读的专题内容与关联文章
                      </Typography.Text>
                    </div>
                  </Space>
                  <Row gutter={[16, 16]}>
                    {spotlightArticles.map((item) => (
                      <Col key={item.id} xs={24} md={12}>
                        <ArticleCard article={item} style="spotlight" />
                      </Col>
                    ))}
                  </Row>
                </div>
              ) : null}

              <div>
                <Space
                  align="center"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <Typography.Title
                      level={3}
                      style={{ margin: 0, color: token.colorTextHeading }}
                    >
                      最新文章
                    </Typography.Title>
                    <Typography.Text style={helperTextStyle}>
                      按发布时间排列，点击标题进入阅读
                    </Typography.Text>
                  </div>
                </Space>

                {feedArticles.length > 0 ? (
                  <Space direction="vertical" size={14} style={{ width: '100%' }}>
                    {feedArticles.map((item) => (
                      <ArticleCard key={item.id} article={item} maxTags={5} />
                    ))}
                  </Space>
                ) : (
                  <Card style={cardStyle}>
                    <Empty description="暂无更多文章" />
                  </Card>
                )}
              </div>
            </Space>
          ) : (
            <Card style={cardStyle}>
              <Empty description="暂无文章" />
            </Card>
          )}

          <div
            style={{
              marginTop: 18,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Typography.Text style={helperTextStyle}>共 {total} 篇</Typography.Text>
            <Pagination
              current={page}
              pageSize={size}
              total={total}
              showTotal={undefined}
              onChange={(nextPage) => {
                setPage(nextPage);
              }}
            />
          </div>
        </Spin>
      </Space>
    </WebShell>
  );
};

export default HomePage;

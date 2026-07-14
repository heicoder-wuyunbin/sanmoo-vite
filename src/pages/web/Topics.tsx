import { AppstoreOutlined, BookOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Pagination, Space, Spin, Tag, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ArticleCard from './components/ArticleCard';
import { fetchWebTopics, fetchWebTopicArticles } from '@/services/blog/api';
import type { TopicItem } from '@/services/blog/types';
import WebShell from '@/pages/web/components/WebShell';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'react-router-dom';

const TopicsPage: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { id } = useParams();
  const location = useLocation();

  const selectedTopicId = id ? Number(id) : undefined;

  useEffect(() => {
    setPage(1);
  }, [location.pathname]);

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadow,
      background: token.colorBgContainer,
    }),
    [token],
  );

  const topicCardStyle = useMemo<React.CSSProperties>(
    () => ({
      ...cardStyle,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      height: '100%',
    }),
    [cardStyle],
  );

  const heroCardStyle = useMemo<React.CSSProperties>(
    () => ({
      ...cardStyle,
      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgElevated} 60%, ${token.colorWarningBg} 100%)`,
    }),
    [cardStyle, token],
  );

  const tagStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: 999,
      paddingInline: 12,
      lineHeight: '26px',
    }),
    [token],
  );

  // 加载专题列表
  const topicsQuery = useQuery({
    queryKey: ['webTopics', 1, 100],
    queryFn: async () => {
      const res = await fetchWebTopics({ page: 1, size: 100 });
      return res.data;
    },
  });

  const topics = useMemo(() => topicsQuery.data?.list || [], [topicsQuery.data]);

  // 加载当前专题的文章
  const articlesQuery = useQuery({
    queryKey: ['webTopicArticles', selectedTopicId, page, size],
    queryFn: async () => {
      if (!selectedTopicId) return null;
      const res = await fetchWebTopicArticles(selectedTopicId, { page, size });
      return res.data;
    },
    enabled: !!selectedTopicId,
  });

  useEffect(() => {
    if (articlesQuery.error) {
      message.error('加载文章列表失败');
    }
  }, [articlesQuery.error, message]);

  const articles = useMemo(() => articlesQuery.data?.list || [], [articlesQuery.data]);
  const total = articlesQuery.data?.total || 0;
  const activeTopic = useMemo(
    () => topics.find((item) => item.id === selectedTopicId),
    [selectedTopicId, topics],
  );

  return (
    <>
      <Helmet>
        <title>{activeTopic ? `${activeTopic.title} - Sanmoo Blog` : '专题合集 - Sanmoo Blog'}</title>
        <meta name="description" content={activeTopic ? `Sanmoo Blog - ${activeTopic.title} 专题系列文章，共 ${total} 篇` : 'Sanmoo Blog 专题合集，体系化阅读技术文章'} />
        <link rel="canonical" href={`${window.location.origin}/topics${selectedTopicId ? `/${selectedTopicId}` : ''}`} />
      </Helmet>
      <WebShell>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
        {/* Hero 卡片 */}
        <Card style={heroCardStyle} styles={{ body: { padding: 28 } }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Tag
              icon={<AppstoreOutlined />}
              color="blue"
              style={{ ...tagStyle, width: 'fit-content' }}
            >
              专题合集
            </Tag>
            <div>
              <Typography.Title
                level={2}
                style={{ margin: 0, color: token.colorText, fontSize: 32 }}
              >
                系列专题 · 体系化阅读
              </Typography.Title>
              <Typography.Paragraph
                style={{
                  margin: '10px 0 0',
                  maxWidth: 720,
                  color: token.colorTextSecondary,
                  fontSize: 15,
                }}
              >
                将零散文章按主题编排为系列专题，帮你构建系统化的知识结构，从入门到深入循序阅读。
              </Typography.Paragraph>
            </div>
            <Space wrap size={[10, 10]}>
              <Tag style={tagStyle}>共 {topics.length} 个专题</Tag>
              {selectedTopicId ? (
                <Tag color="blue" style={tagStyle}>
                  当前查看：{activeTopic?.title}
                </Tag>
              ) : null}
              {selectedTopicId ? (
                <Tag style={tagStyle}>共 {total} 篇文章</Tag>
              ) : null}
            </Space>
          </Space>
        </Card>

        {/* 专题网格 */}
        <Spin spinning={topicsQuery.isLoading}>
          <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Typography.Title level={4} style={{ margin: 0, color: token.colorText }}>
                  专题列表
                </Typography.Title>
                <Typography.Paragraph
                  style={{ margin: '6px 0 0', color: token.colorTextTertiary }}
                >
                  点击专题卡片进入对应系列文章，开始体系化阅读。
                </Typography.Paragraph>
              </div>
              {topics.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 16,
                  }}
                >
                  <Link
                    to="/topics"
                    style={{ textDecoration: 'none' }}
                    onClick={() => setPage(1)}
                  >
                    <Card
                      style={{
                        ...topicCardStyle,
                        borderColor: !selectedTopicId
                          ? token.colorPrimary
                          : token.colorBorderSecondary,
                        background: !selectedTopicId
                          ? token.colorPrimaryBg
                          : token.colorBgContainer,
                      }}
                      styles={{ body: { padding: 20 } }}
                    >
                      <Space direction="vertical" size={4}>
                        <Typography.Text strong style={{ fontSize: 15 }}>
                          全部文章
                        </Typography.Text>
                        <Typography.Text
                          style={{ color: token.colorTextTertiary, fontSize: 13 }}
                        >
                          浏览所有文章
                        </Typography.Text>
                      </Space>
                    </Card>
                  </Link>
                  {topics.map((item: TopicItem) => (
                    <Link
                      key={`topic-${item.id}`}
                      to={`/topics/${item.id}`}
                      style={{ textDecoration: 'none' }}
                      onClick={() => setPage(1)}
                    >
                      <Card
                        style={{
                          ...topicCardStyle,
                          borderColor:
                            selectedTopicId === item.id
                              ? token.colorPrimary
                              : token.colorBorderSecondary,
                          background:
                            selectedTopicId === item.id
                              ? token.colorPrimaryBg
                              : token.colorBgContainer,
                        }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <Space direction="vertical" size={6} style={{ width: '100%' }}>
                          <Space align="center">
                            <BookOutlined
                              style={{
                                color:
                                  selectedTopicId === item.id
                                    ? token.colorPrimary
                                    : token.colorTextTertiary,
                              }}
                            />
                            <Typography.Text strong style={{ fontSize: 15 }}>
                              {item.title}
                            </Typography.Text>
                          </Space>
                          {item.description ? (
                            <Typography.Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{
                                margin: 0,
                                color: token.colorTextSecondary,
                                fontSize: 13,
                              }}
                            >
                              {item.description}
                            </Typography.Paragraph>
                          ) : null}
                          <Tag color="blue" style={{ ...tagStyle, width: 'fit-content' }}>
                            {item.articleCount} 篇文章
                          </Tag>
                        </Space>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Empty description="暂无专题" />
              )}
            </Space>
          </Card>
        </Spin>

        {/* 专题详情 */}
        {selectedTopicId && activeTopic ? (
          <Spin spinning={articlesQuery.isLoading}>
            {/* 专题头部 */}
            <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <Tag
                      icon={<BookOutlined />}
                      color="blue"
                      style={{ ...tagStyle, width: 'fit-content', marginBottom: 12 }}
                    >
                      专题系列
                    </Tag>
                    <Typography.Title level={2} style={{ margin: 0, color: token.colorText, fontSize: 28 }}>
                      {activeTopic.title}
                    </Typography.Title>
                    <Typography.Paragraph
                      style={{
                        margin: '12px 0 0',
                        color: token.colorTextSecondary,
                        fontSize: 15,
                        lineHeight: 1.7,
                      }}
                    >
                      {activeTopic.description || `围绕 ${activeTopic.title} 的系列文章，体系化阅读，从入门到深入。`}
                    </Typography.Paragraph>
                  </div>
                  <Link to="/topics">
                    <Button>返回专题列表</Button>
                  </Link>
                </div>

                {/* 专题统计 */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
                    <Typography.Text style={{ color: token.colorTextSecondary }}>
                      共 <strong style={{ color: token.colorText }}>{activeTopic.articleCount}</strong> 篇文章
                    </Typography.Text>
                  </div>
                  {activeTopic.createTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Typography.Text style={{ color: token.colorTextSecondary }}>
                        创建于 {activeTopic.createTime.slice(0, 10)}
                      </Typography.Text>
                    </div>
                  )}
                </div>

                {/* 学习路径提示 */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: token.colorInfoBg,
                    borderRadius: token.borderRadius,
                    border: `1px solid ${token.colorInfoBorder}`,
                  }}
                >
                  <Typography.Text style={{ color: token.colorInfoText, fontSize: 13 }}>
                    💡 建议按顺序阅读，从基础概念到进阶实践，逐步构建知识体系
                  </Typography.Text>
                </div>
              </Space>
            </Card>

            {/* 文章列表 */}
            <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Title level={4} style={{ margin: 0, color: token.colorText }}>
                    专题文章
                  </Typography.Title>
                  <Typography.Text style={{ color: token.colorTextSecondary }}>
                    共 {total} 篇
                  </Typography.Text>
                </div>

                {articles.length > 0 ? (
                  <Space direction="vertical" size={14} style={{ width: '100%' }}>
                    {articles.map((item: any, index: number) => (
                      <div key={item.id} style={{ position: 'relative' }}>
                        {/* 序号标记 */}
                        <div
                          style={{
                            position: 'absolute',
                            left: -8,
                            top: 20,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: token.colorPrimary,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 600,
                            zIndex: 1,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div style={{ paddingLeft: 24 }}>
                          <ArticleCard article={item} maxTags={4} />
                        </div>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Empty description="该专题暂无文章" />
                )}

                {total > size ? (
                  <div style={{ textAlign: 'center', paddingTop: 8 }}>
                    <Pagination
                      current={page}
                      pageSize={size}
                      total={total}
                      onChange={(p, s) => {
                        setPage(p);
                        setSize(s);
                      }}
                      showSizeChanger
                      showTotal={(t) => `共 ${t} 篇文章`}
                    />
                  </div>
                ) : null}
              </Space>
            </Card>
          </Spin>
        ) : null}
      </Space>
    </WebShell>
    </>
  );
};

export default TopicsPage;
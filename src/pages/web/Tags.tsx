import { TagsOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Pagination, Space, Spin, Tag, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ArticleCard from './components/ArticleCard';
import { fetchArticles, fetchTagArticles } from '@/services/blog/api';
import WebShell from '@/pages/web/components/WebShell';
import { useQuery } from '@tanstack/react-query';
import { useLayoutStore } from '@/store/useLayoutStore';
import { Link, useParams, useLocation } from 'react-router-dom';

const TagsPage: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const { tags } = useLayoutStore();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { id } = useParams();
  const location = useLocation();

  const selectedTagId = id ? Number(id) : undefined;

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

  const tagStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: 999,
      paddingInline: 12,
      lineHeight: '26px',
      cursor: 'pointer',
      marginInlineEnd: 0,
    }),
    [token],
  );

  const tagStyleDefault = useMemo<React.CSSProperties>(
    () => ({
      ...tagStyle,
      cursor: 'default',
    }),
    [tagStyle],
  );

  const heroCardStyle = useMemo<React.CSSProperties>(
    () => ({
      ...cardStyle,
      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgElevated} 60%, ${token.colorWarningBg} 100%)`,
    }),
    [cardStyle, token],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['tagArticles', page, size, selectedTagId],
    queryFn: async () => {
      if (selectedTagId) {
        const res = await fetchTagArticles(selectedTagId, { page, size });
        return res.data;
      }
      const res = await fetchArticles({ page, size });
      return res.data;
    },
  });

  useEffect(() => {
    if (error) {
      message.error('加载文章列表失败');
    }
  }, [error, message]);

  const articles = useMemo(() => data?.list || [], [data?.list]);
  const total = data?.total || 0;
  const activeTag = useMemo(
    () => tags.find((item) => item.id === selectedTagId),
    [selectedTagId, tags],
  );

  return (
    <>
      <Helmet>
        <title>{activeTag ? `${activeTag.name} - Sanmoo Blog` : '标签索引 - Sanmoo Blog'}</title>
        <meta name="description" content={activeTag ? `Sanmoo Blog - ${activeTag.name} 标签下的全部文章，共 ${total} 篇` : 'Sanmoo Blog 标签索引，按主题关键词浏览技术文章'} />
        <link rel="canonical" href={`${window.location.origin}/tags${selectedTagId ? `/${selectedTagId}` : ''}`} />
      </Helmet>
      <WebShell>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card style={heroCardStyle} styles={{ body: { padding: 28 } }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Tag
              icon={<TagsOutlined />}
              color="gold"
              style={{ ...tagStyleDefault, width: 'fit-content' }}
            >
              标签索引
            </Tag>
            <div>
              <Typography.Title
                level={2}
                style={{ margin: 0, color: token.colorText, fontSize: 32 }}
              >
                按主题浏览技术文章
              </Typography.Title>
              <Typography.Paragraph
                style={{
                  margin: '10px 0 0',
                  maxWidth: 720,
                  color: token.colorTextSecondary,
                  fontSize: 15,
                }}
              >
                适合按技术栈、专题关键词和知识主题检索内容，帮助你从零散文章快速进入连续阅读状态。
              </Typography.Paragraph>
            </div>
            <Space wrap size={[10, 10]}>
              <Tag style={tagStyleDefault}>共 {tags.length} 个标签</Tag>
              <Tag color="blue" style={tagStyleDefault}>
                {selectedTagId ? `当前查看：${activeTag?.name}` : '当前查看：全部'}
              </Tag>
              <Tag style={tagStyleDefault}>共 {total} 篇文章</Tag>
            </Space>
          </Space>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0, color: token.colorText }}>
                标签墙
              </Typography.Title>
              <Typography.Paragraph
                style={{ margin: '6px 0 0', color: token.colorTextTertiary }}
              >
                选中标签后，下方文章列表立即切换为对应主题结果。
              </Typography.Paragraph>
            </div>
            <Space wrap size={[10, 12]}>
              <Link to="/tags" style={{ textDecoration: 'none' }}>
                <Tag
                  color={!selectedTagId ? 'gold' : 'default'}
                  style={tagStyle}
                >
                  全部文章
                </Tag>
              </Link>
              {tags.map((item) => (
                <Link key={`tag-${item.id}`} to={`/tags/${item.id}`} style={{ textDecoration: 'none' }}>
                  <Tag
                    color={selectedTagId === item.id ? 'gold' : 'default'}
                    style={tagStyle}
                  >
                    {item.name} · {item.articleCount}
                  </Tag>
                </Link>
              ))}
            </Space>
          </Space>
        </Card>

        <Spin spinning={isLoading}>
          <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <Typography.Title
                    level={3}
                    style={{ margin: 0, color: token.colorText }}
                  >
                    {selectedTagId ? `当前标签：${activeTag?.name || ''}` : '全部文章'}
                  </Typography.Title>
                  <Typography.Text style={{ color: token.colorTextSecondary }}>
                    {selectedTagId
                      ? `围绕 ${activeTag?.name || '当前标签'} 的相关文章与实践内容`
                      : '展示全部文章，方便从标签索引回退到完整列表'}
                  </Typography.Text>
                </div>
                {selectedTagId ? (
                  <Link to="/tags">
                    <Button>查看全部文章</Button>
                  </Link>
                ) : null}
              </div>

              {articles.length > 0 ? (
                <Space direction="vertical" size={14} style={{ width: '100%' }}>
                  {articles.map((item) => (
                    <ArticleCard key={item.id} article={item} maxTags={4} />
                  ))}
                </Space>
              ) : (
                <Empty
                  description={selectedTagId ? '该标签下暂无文章' : '暂无文章'}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  {selectedTagId ? (
                    <Link to="/tags">
                      <Button>返回全部文章</Button>
                    </Link>
                  ) : null}
                </Empty>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Typography.Text style={{ color: token.colorTextSecondary }}>
                  共 {total} 篇
                </Typography.Text>
                <Pagination
                  current={page}
                  pageSize={size}
                  total={total}
                  showSizeChanger
                  showTotal={undefined}
                  onChange={(nextPage, nextSize) => {
                    setPage(nextPage);
                    setSize(nextSize);
                  }}
                />
              </div>
            </Space>
          </Card>
        </Spin>
      </Space>
    </WebShell>
    </>
  );
};

export default TagsPage;

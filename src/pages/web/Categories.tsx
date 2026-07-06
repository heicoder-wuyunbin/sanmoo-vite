import { FolderOpenOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Pagination, Space, Spin, Tag, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ArticleCard from './components/ArticleCard';
import { fetchArticles, fetchCategoryArticles } from '@/services/blog/api';
import WebShell from '@/pages/web/components/WebShell';
import { useQuery } from '@tanstack/react-query';
import { useLayoutStore } from '@/store/useLayoutStore';
import { Link, useParams, useLocation } from 'react-router-dom';

const CategoriesPage: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const { categories } = useLayoutStore();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { id } = useParams();
  const location = useLocation();

  const selectedCategoryId = id ? Number(id) : undefined;

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

  const normalizedCategories = useMemo(
    () =>
      categories.filter(
        (item) =>
          item &&
          item.id !== undefined &&
          item.id !== null &&
          typeof item.name === 'string' &&
          item.name.trim().length > 0,
      ),
    [categories],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['categoryArticles', page, size, selectedCategoryId],
    queryFn: async () => {
      if (selectedCategoryId) {
        const res = await fetchCategoryArticles(selectedCategoryId, { page, size });
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
  const activeCategory = useMemo(
    () => normalizedCategories.find((item) => item.id === selectedCategoryId),
    [normalizedCategories, selectedCategoryId],
  );

  return (
    <>
      <Helmet>
        <title>{activeCategory ? `${activeCategory.name} - Sanmoo Blog` : '分类索引 - Sanmoo Blog'}</title>
        <meta name="description" content={activeCategory ? `Sanmoo Blog - ${activeCategory.name} 分类下的全部文章，共 ${total} 篇` : 'Sanmoo Blog 分类索引，按主题浏览技术文章'} />
        <link rel="canonical" href={`${window.location.origin}/categories${selectedCategoryId ? `/${selectedCategoryId}` : ''}`} />
      </Helmet>
      <WebShell>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card style={heroCardStyle} styles={{ body: { padding: 28 } }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Tag
              icon={<FolderOpenOutlined />}
              color="blue"
              style={{ ...tagStyleDefault, width: 'fit-content' }}
            >
              分类索引
            </Tag>
            <div>
              <Typography.Title
                level={2}
                style={{ margin: 0, color: token.colorText, fontSize: 32 }}
              >
                按分类进入知识目录
              </Typography.Title>
              <Typography.Paragraph
                style={{
                  margin: '10px 0 0',
                  maxWidth: 720,
                  color: token.colorTextSecondary,
                  fontSize: 15,
                }}
              >
                适合从文章主题视角建立整体认知，先进入分类，再继续阅读对应标签与详细内容。
              </Typography.Paragraph>
            </div>
            <Space wrap size={[10, 10]}>
                <Tag style={tagStyleDefault}>
                  共 {normalizedCategories.length} 个分类
                </Tag>
              <Tag color="blue" style={tagStyleDefault}>
                {selectedCategoryId
                  ? `当前查看：${activeCategory?.name || ''}`
                  : '当前查看：全部'}
              </Tag>
              <Tag style={tagStyleDefault}>共 {total} 篇文章</Tag>
            </Space>
          </Space>
        </Card>

        <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0, color: token.colorText }}>
                分类墙
              </Typography.Title>
              <Typography.Paragraph
                style={{ margin: '6px 0 0', color: token.colorTextTertiary }}
              >
                每个分类代表一类长期沉淀的技术主题。
              </Typography.Paragraph>
            </div>
            <Space wrap size={[10, 12]}>
              <Link to="/categories" style={{ textDecoration: 'none' }}>
                <Tag
                  color={!selectedCategoryId ? 'blue' : 'default'}
                  style={tagStyle}
                >
                  全部文章
                </Tag>
              </Link>
              {normalizedCategories.map((item, index) => (
                <Link key={`category-${item.id ?? item.name ?? 'item'}-${index}`} to={`/categories/${item.id}`} style={{ textDecoration: 'none' }}>
                  <Tag
                    color={selectedCategoryId === item.id ? 'blue' : 'default'}
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
                    {selectedCategoryId ? `当前分类：${activeCategory?.name || ''}` : '全部文章'}
                  </Typography.Title>
                  <Typography.Text style={{ color: token.colorTextSecondary }}>
                    {selectedCategoryId
                      ? `围绕 ${activeCategory?.name || '当前分类'} 的相关文章`
                      : '展示全部文章，便于从分类导航回退到完整列表'}
                  </Typography.Text>
                </div>
                {selectedCategoryId ? (
                  <Link to="/categories">
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
                  description={selectedCategoryId ? '该分类下暂无文章' : '暂无文章'}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  {selectedCategoryId ? (
                    <Link to="/categories">
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

export default CategoriesPage;

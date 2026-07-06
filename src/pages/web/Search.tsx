import { SearchOutlined, ClockCircleOutlined, EyeOutlined, TagOutlined } from '@ant-design/icons';
import {
  App,
  Card,
  Empty,
  Input,
  Pagination,
  Space,
  Spin,
  Tag,
  Typography,
  theme as antTheme,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WebShell from '@/pages/web/components/WebShell';
import { fetchArticles } from '@/services/blog/api';
import type { ArticleItem } from '@/services/blog/api';
import { useQuery } from '@tanstack/react-query';

const { Title, Text } = Typography;

const SearchPage: React.FC = () => {
  const { token } = antTheme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';
  const [keywordInput, setKeywordInput] = useState(initialKeyword);
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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['search', keywordInput, page, size],
    queryFn: async () => {
      const res = await fetchArticles({ keyword: keywordInput, page, size });
      return res.data;
    },
    enabled: false,
  });

  useEffect(() => {
    if (initialKeyword) {
      setKeywordInput(initialKeyword);
      setPage(1);
      refetch();
    }
  }, [initialKeyword, refetch]);

  useEffect(() => {
    if (keywordInput.trim()) {
      refetch();
    }
  }, [page, keywordInput.trim()]);

  useEffect(() => {
    if (error) {
      message.error('搜索失败，请重试');
    }
  }, [error, message]);

  const articles = useMemo(() => data?.list || [], [data?.list]);
  const total = data?.total || 0;

  const handleSearch = () => {
    if (!keywordInput.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }
    setPage(1);
    navigate(`/search?keyword=${encodeURIComponent(keywordInput)}`);
    refetch();
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleArticleClick = (article: ArticleItem) => {
    navigate(`/article/${article.id}`);
  };

  return (
    <>
      <Helmet>
        <title>{keywordInput ? `${keywordInput} - 搜索结果 - Sanmoo Blog` : '搜索 - Sanmoo Blog'}</title>
        <meta name="description" content={keywordInput ? `Sanmoo Blog - "${keywordInput}" 的搜索结果，共 ${total} 篇文章` : 'Sanmoo Blog 技术文章搜索'} />
        <link rel="canonical" href={`${window.location.origin}/search${keywordInput ? `?keyword=${encodeURIComponent(keywordInput)}` : ''}`} />
      </Helmet>
      <WebShell>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
        {/* 搜索结果标题区 */}
        <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SearchOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
              <Title level={2} style={{ margin: 0 }}>
                搜索结果
              </Title>
            </div>
            <Input.Search
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onSearch={handleSearch}
              onPressEnter={handleSearch}
              placeholder="输入关键词搜索文章..."
              size="large"
              enterButton
              style={{ maxWidth: 560 }}
            />
            {keywordInput && (
              <Text type="secondary">
                搜索 "{keywordInput}" 的结果，共 {total} 篇文章
              </Text>
            )}
          </Space>
        </Card>

        {/* 搜索结果列表 */}
        <Spin spinning={isLoading} tip="正在搜索...">
          {articles.length > 0 ? (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {articles.map((article) => (
                <Card
                  key={article.id}
                  hoverable
                  style={cardStyle}
                  styles={{ body: { padding: 20 } }}
                  onClick={() => handleArticleClick(article)}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Title
                        level={4}
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 600,
                          color: token.colorTextHeading,
                        }}
                      >
                        {article.title}
                      </Title>
                      {article.isTop && (
                        <Tag color="red" style={{ fontSize: 12 }}>
                          置顶
                        </Tag>
                      )}
                    </div>
                    {article.description && (
                      <Text
                        type="secondary"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: 14,
                          lineHeight: 1.6,
                        }}
                      >
                        {article.description}
                      </Text>
                    )}
                    <Space size={16} wrap style={{ marginTop: 8 }}>
                      {article.categoryName && (
                        <Space size={4}>
                          <TagOutlined style={{ fontSize: 12, color: token.colorTextTertiary }} />
                          <Text style={{ fontSize: 13, color: token.colorTextSecondary }}>
                            {article.categoryName}
                          </Text>
                        </Space>
                      )}
                      <Space size={4}>
                        <ClockCircleOutlined style={{ fontSize: 12, color: token.colorTextTertiary }} />
                        <Text style={{ fontSize: 13, color: token.colorTextSecondary }}>
                          {article.createTime?.split('T')[0]}
                        </Text>
                      </Space>
                      <Space size={4}>
                        <EyeOutlined style={{ fontSize: 12, color: token.colorTextTertiary }} />
                        <Text style={{ fontSize: 13, color: token.colorTextSecondary }}>
                          {article.readNum || 0} 阅读
                        </Text>
                      </Space>
                    </Space>
                    {article.tags && article.tags.length > 0 && (
                      <Space size={8} wrap style={{ marginTop: 4 }}>
                        {article.tags.map((tag) => (
                          <Tag key={tag.id} style={{ fontSize: 12 }}>
                            {tag.name}
                          </Tag>
                        ))}
                      </Space>
                    )}
                  </Space>
                </Card>
              ))}
            </Space>
          ) : (
            <Card style={cardStyle}>
              <Empty
                description={
                  <Space direction="vertical" align="center" size={8}>
                    <Text strong style={{ fontSize: 16 }}>
                      未找到相关文章
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      试试其他关键词？
                    </Text>
                  </Space>
                }
              />
            </Card>
          )}

          {total > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 12,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                共 {total} 篇
              </Text>
              <Pagination
                current={page}
                total={total}
                pageSize={size}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </Spin>
      </Space>
    </WebShell>
    </>
  );
};

export default SearchPage;

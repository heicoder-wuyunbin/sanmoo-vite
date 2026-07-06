import { Link } from 'react-router-dom';
import {
  App,
  Card,
  Empty,
  List,
  Space,
  Spin,
  Tag,
  Typography,
  theme as antTheme,
} from 'antd';
import { ArrowRightOutlined, ArrowDownOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  type ArchiveItem,
  fetchArchives,
} from '@/services/blog/api';
import WebShell from '@/pages/web/components/WebShell';
import { useQuery } from '@tanstack/react-query';

const ArchivesPage: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadow,
      background: token.colorBgContainer,
    }),
    [token],
  );

  const { data: archives = [], isLoading, error } = useQuery({
    queryKey: ['archives'],
    queryFn: async () => {
      const res = await fetchArchives();
      return res.data.list as ArchiveItem[];
    },
  });

  useEffect(() => {
    if (error) {
      message.error('加载归档失败');
    }
  }, [error, message]);

  const normalizedArchives = useMemo(
    () =>
      (archives || [])
        .filter(Boolean)
        .map((item, index) => ({
          month:
            typeof item?.month === 'string' && item.month.trim().length > 0
              ? item.month
              : `未知月份 ${index + 1}`,
          articles: Array.isArray(item?.items)
            ? item.items.filter(
                (article) =>
                  article &&
                  article.id !== undefined &&
                  article.id !== null &&
                  typeof article.title === 'string' &&
                  article.title.trim().length > 0,
              )
            : [],
        })),
    [archives],
  );

  useEffect(() => {
    if (normalizedArchives.length > 0) {
      setExpandedMonths(new Set([normalizedArchives[0].month]));
    }
  }, [normalizedArchives]);

  return (
    <>
      <Helmet>
        <title>文章归档 - Sanmoo Blog</title>
        <meta name="description" content="Sanmoo Blog 文章归档，按年月查看历史技术文章" />
        <link rel="canonical" href={`${window.location.origin}/archives`} />
      </Helmet>
      <WebShell>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card
          style={{
            ...cardStyle,
            background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorWarningBg} 100%)`,
          }}
          styles={{ body: { padding: 28 } }}
        >
          <Typography.Title level={2} style={{ margin: 0, color: token.colorText }}>
            文章归档
          </Typography.Title>
          <Typography.Paragraph
            style={{ margin: '10px 0 0', color: token.colorTextSecondary, maxWidth: 720 }}
          >
            按年月查看历史文章，共{' '}
            {normalizedArchives.reduce((sum, item) => sum + item.articles.length, 0)} 篇。
          </Typography.Paragraph>
        </Card>

        <Spin spinning={isLoading}>
          {normalizedArchives.length === 0 ? (
            <Card style={cardStyle}>
              <Empty description="暂无归档" />
            </Card>
          ) : (
            <Card style={{ ...cardStyle, overflow: 'hidden' }}>
              <div style={{ padding: 20 }}>
                {normalizedArchives.map((archive, index) => {
                  const isExpanded = expandedMonths.has(archive.month);
                  return (
                    <div key={archive.month} style={{ marginBottom: index === normalizedArchives.length - 1 ? 0 : 24 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 12,
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                        }}
                        onClick={() => toggleMonth(archive.month)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = token.colorPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = token.colorText;
                        }}
                      >
                        <div
                          style={{
                            width: 4,
                            height: 20,
                            backgroundColor: token.colorPrimary,
                            borderRadius: 2,
                            marginRight: 12,
                          }}
                        />
                        {isExpanded ? (
                          <ArrowDownOutlined style={{ marginRight: 8, fontSize: 14, color: token.colorTextSecondary }} />
                        ) : (
                          <ArrowRightOutlined style={{ marginRight: 8, fontSize: 14, color: token.colorTextSecondary }} />
                        )}
                        <Typography.Title
                          level={4}
                          style={{ margin: 0, color: token.colorText }}
                        >
                          {archive.month}
                        </Typography.Title>
                        <Tag
                          style={{
                            marginLeft: 12,
                            backgroundColor: `${token.colorPrimary}15`,
                            borderColor: token.colorPrimary,
                            color: token.colorPrimary,
                          }}
                        >
                          {archive.articles.length} 篇
                        </Tag>
                      </div>
                      {isExpanded && (
                        <List
                          dataSource={archive.articles}
                          renderItem={(item: { id: number; title: string; createTime: string }, idx) => (
                            <List.Item
                              key={item.id}
                              style={{
                                padding: '8px 0',
                                paddingLeft: 16,
                                borderBottom:
                                  idx === archive.articles.length - 1 && index === normalizedArchives.length - 1
                                    ? 'none'
                                    : `1px solid ${token.colorBorderSecondary}`,
                              }}
                            >
                              <Space size={12} style={{ width: '100%' }}>
                                <Typography.Text
                                  type="secondary"
                                  style={{ fontSize: 13, flexShrink: 0 }}
                                >
                                  {item.createTime ? item.createTime.slice(5, 10) : '--'}
                                </Typography.Text>
                                <Link
                                  to={`/article/${item.id}`}
                                  style={{
                                    color: token.colorText,
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    flex: 1,
                                    transition: 'color 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = token.colorPrimary;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = token.colorText;
                                  }}
                                >
                                  {item.title}
                                </Link>
                              </Space>
                            </List.Item>
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </Spin>
      </Space>
    </WebShell>
    </>
  );
};

export default ArchivesPage;

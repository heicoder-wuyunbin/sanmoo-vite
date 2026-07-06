import { HeartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Card, Empty, Space, Typography, theme as antTheme } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import WebShell from '@/pages/web/components/WebShell';
import { getFavorites, removeFavorite, type FavoriteItem } from '@/services/local/localStorage';

const FavoritesPage: React.FC = () => {
  const { token } = antTheme.useToken();

  const favorites = useMemo(() => getFavorites(), []);

  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadowSecondary,
      background: token.colorBgContainer,
    }),
    [token],
  );

  const handleRemove = (articleId: number) => {
    removeFavorite(articleId);
    window.location.reload();
  };

  return (
    <WebShell hideSidebar>
      <Card
        style={cardStyle}
        styles={{ body: { padding: 24 } }}
        title={
          <Typography.Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeartOutlined style={{ color: '#ff4d4f' }} />
            我的收藏
          </Typography.Title>
        }
      >
        {favorites.length === 0 ? (
          <Empty description="暂无收藏的文章" />
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {favorites.map((item: FavoriteItem) => (
              <Link
                key={item.id}
                to={`/article/${item.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  borderRadius: token.borderRadiusLG,
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
                {item.titleImage && (
                  <img
                    src={item.titleImage}
                    alt={item.title}
                    style={{
                      width: 120,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: token.borderRadiusSM,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Typography.Text strong style={{ fontSize: 16, color: token.colorText }}>
                    {item.title}
                  </Typography.Text>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {item.categoryName || '未分类'}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.addedAt).format('YYYY-MM-DD')}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      阅读 {item.readNum || 0}
                    </Typography.Text>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(item.id);
                  }}
                  style={{
                    padding: '4px 12px',
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusSM,
                    backgroundColor: token.colorBgContainer,
                    color: token.colorTextSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#ff4d4f';
                    (e.currentTarget as HTMLElement).style.color = '#ff4d4f';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = token.colorBorderSecondary;
                    (e.currentTarget as HTMLElement).style.color = token.colorTextSecondary;
                  }}
                >
                  取消收藏
                </button>
              </Link>
            ))}
          </Space>
        )}
      </Card>
    </WebShell>
  );
};

export default FavoritesPage;

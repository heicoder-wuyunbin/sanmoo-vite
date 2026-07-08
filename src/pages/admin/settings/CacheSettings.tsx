import { ClearOutlined, DatabaseOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  App, Button, Card, Col, Empty, Popconfirm, Row, Space, Statistic,
  Table, Tag, Typography, theme as antTheme,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clearCache, fetchCacheStats, warmupCache } from '@/services/blog/settings-api';

const CacheSettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const queryClient = useQueryClient();
  const [clearing, setClearing] = useState(false);
  const [warming, setWarming] = useState(false);

  const { data: cacheStats, isLoading: cacheLoading, refetch: refetchCache } = useQuery({
    queryKey: ['cacheStats'],
    queryFn: async () => {
      const res = await fetchCacheStats();
      return res.data?.data;
    },
    refetchInterval: 30000,
  });

  const handleClearCache = useCallback(async () => {
    setClearing(true);
    try {
      const res = await clearCache();
      if (res.success) {
        message.success('所有业务缓存已清空');
        queryClient.invalidateQueries({ queryKey: ['cacheStats'] });
      } else {
        message.error(res.errorMessage || '清空缓存失败');
      }
    } catch {
      message.error('清空缓存失败，请检查 Redis 连接');
    } finally {
      setClearing(false);
    }
  }, [queryClient, message]);

  const handleWarmupCache = useCallback(async () => {
    setWarming(true);
    try {
      const res = await warmupCache();
      if (res.success) {
        const data = res.data;
        const parts: string[] = [];
        if (data.categories) parts.push('分类');
        if (data.tags) parts.push('标签');
        if (data.articles > 0) parts.push(`文章(${data.articles}篇)`);
        if (data.dashboard) parts.push('仪表盘');
        if (data.settings) parts.push('设置');
        if (data.archives) parts.push('归档');
        if (data.hotSearches) parts.push('热门搜索');
        message.success(`缓存预热完成：${parts.join('、')}`);
        queryClient.invalidateQueries({ queryKey: ['cacheStats'] });
      } else {
        message.error(res.errorMessage || '缓存预热失败');
      }
    } catch {
      message.error('缓存预热失败，请检查服务状态');
    } finally {
      setWarming(false);
    }
  }, [queryClient, message]);

  return (
    <div className="cache-settings-container">
      <Card
        style={{
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '24px 32px',
            background: `linear-gradient(135deg, ${token.colorPrimary}15 0%, ${token.colorPrimary}08 100%)`,
            margin: '-24px -24px 24px',
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          <Space direction="vertical" size={8}>
            <Typography.Title level={3} style={{ margin: 0, fontWeight: 600 }}>
              缓存管理
            </Typography.Title>
            <Typography.Text type="secondary">
              查看缓存状态、清理缓存与预热缓存，优化系统性能。
            </Typography.Text>
          </Space>
        </div>

        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Card
            size="small"
            title="缓存操作"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.1s both',
            }}
            styles={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Space size="middle" wrap>
              <Popconfirm
                title="确认清空缓存"
                description="将清空所有业务缓存（blog:*），确定继续吗？"
                onConfirm={handleClearCache}
                okText="确认清空"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="primary"
                  danger
                  icon={<ClearOutlined />}
                  loading={clearing}
                  size="large"
                  style={{
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  一键清空缓存
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认缓存预热"
                description="将从数据库重新加载数据并写入缓存，确定继续吗？"
                onConfirm={handleWarmupCache}
                okText="确认预热"
                cancelText="取消"
              >
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  loading={warming}
                  size="large"
                  style={{
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  一键缓存预热
                </Button>
              </Popconfirm>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetchCache()}
                loading={cacheLoading}
                size="large"
                style={{
                  borderRadius: token.borderRadiusLG,
                }}
              >
                刷新状态
              </Button>
            </Space>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
              缓存预热会从数据库加载常用数据并写入 Redis，提升首次访问速度。
            </Typography.Text>
          </Card>

          <Card
            size="small"
            title="缓存统计"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.15s both',
            }}
            styles={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="缓存 Key 总数"
                  value={cacheStats?.totalKeys ?? 0}
                  prefix={<DatabaseOutlined style={{ color: token.colorPrimary }} />}
                  style={{
                    background: `${token.colorBgLayout}`,
                    padding: '16px',
                    borderRadius: token.borderRadiusLG,
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="缓存分类数"
                  value={cacheStats?.prefixCounts ? Object.keys(cacheStats.prefixCounts).length : 0}
                  style={{
                    background: `${token.colorBgLayout}`,
                    padding: '16px',
                    borderRadius: token.borderRadiusLG,
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Redis 内存占用"
                  value={cacheStats?.memoryUsed ?? '-'}
                  style={{
                    background: `${token.colorBgLayout}`,
                    padding: '16px',
                    borderRadius: token.borderRadiusLG,
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="缓存命中率"
                  value={cacheStats?.hitRate ?? '-'}
                  suffix="%"
                  style={{
                    background: `${token.colorBgLayout}`,
                    padding: '16px',
                    borderRadius: token.borderRadiusLG,
                  }}
                  valueStyle={{
                    color: parseFloat(cacheStats?.hitRate || '0') >= 80 ? token.colorSuccess : parseFloat(cacheStats?.hitRate || '0') >= 50 ? token.colorWarning : token.colorError,
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="命中次数"
                  value={cacheStats?.hitCount ?? 0}
                  style={{
                    background: `${token.colorBgLayout}`,
                    padding: '16px',
                    borderRadius: token.borderRadiusLG,
                  }}
                  valueStyle={{ color: token.colorSuccess }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="未命中次数"
                  value={cacheStats?.missCount ?? 0}
                  style={{
                    background: `${token.colorBgLayout}`,
                    padding: '16px',
                    borderRadius: token.borderRadiusLG,
                  }}
                  valueStyle={{ color: token.colorError }}
                />
              </Col>
            </Row>
          </Card>

          <Card
            size="small"
            title="缓存分类详情"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.2s both',
            }}
            styles={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            {cacheStats?.prefixCounts && Object.keys(cacheStats.prefixCounts).length > 0 ? (
              <Table
                dataSource={Object.entries(cacheStats.prefixCounts).map(([prefix, count]) => {
                  const total = cacheStats?.totalKeys || 1;
                  const percentage = ((count / total) * 100).toFixed(1);
                  return { key: prefix, prefix, count, percentage };
                })}
                columns={[
                  {
                    title: '缓存分类',
                    dataIndex: 'prefix',
                    key: 'prefix',
                    render: (text: string) => <Tag color="blue">{text}</Tag>,
                  },
                  {
                    title: 'Key 数量',
                    dataIndex: 'count',
                    key: 'count',
                    align: 'right' as const,
                    render: (count: number) => <Typography.Text strong>{count}</Typography.Text>,
                  },
                  {
                    title: '占比',
                    dataIndex: 'percentage',
                    key: 'percentage',
                    align: 'right' as const,
                    render: (percentage: string) => (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <div
                          style={{
                            width: 60,
                            height: 6,
                            background: `${token.colorBorderSecondary}`,
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(parseFloat(percentage), 100)}%`,
                              height: '100%',
                              background: token.colorPrimary,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12 }}>{percentage}%</span>
                      </div>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description={cacheLoading ? '加载中...' : '暂无缓存数据，请先执行缓存预热'} />
            )}
          </Card>
        </Space>
      </Card>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cache-settings-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CacheSettings;

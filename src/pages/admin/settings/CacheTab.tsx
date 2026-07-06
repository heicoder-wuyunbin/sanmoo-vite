import { ClearOutlined, DatabaseOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  App, Button, Card, Col, Empty, Popconfirm, Row, Space, Statistic,
  Table, Tag, Typography,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clearCache, fetchCacheStats, warmupCache } from '@/services/blog/api';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const CacheTab: React.FC = () => {
  const { message } = App.useApp();
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
    } catch { message.error('清空缓存失败，请检查 Redis 连接'); }
    finally { setClearing(false); }
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
    } catch { message.error('缓存预热失败，请检查服务状态'); }
    finally { setWarming(false); }
  }, [queryClient, message]);

  return (
    <Card style={{ ...ADMIN_CARD_STYLE, marginBottom: 16 }}>
      <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        管理 Redis 业务缓存，支持一键清空、缓存预热及实时状态监控。
      </Typography.Text>
      <Space size="middle" wrap style={{ marginBottom: 24 }}>
        <Popconfirm title="确认清空缓存" description="将清空所有业务缓存（blog:*），确定继续吗？"
          onConfirm={handleClearCache} okText="确认清空" cancelText="取消" okButtonProps={{ danger: true }}>
          <Button type="primary" danger icon={<ClearOutlined />} loading={clearing}>一键清空缓存</Button>
        </Popconfirm>
        <Popconfirm title="确认缓存预热" description="将从数据库重新加载数据并写入缓存，确定继续吗？"
          onConfirm={handleWarmupCache} okText="确认预热" cancelText="取消">
          <Button type="primary" icon={<ThunderboltOutlined />} loading={warming}>一键缓存预热</Button>
        </Popconfirm>
        <Button icon={<ReloadOutlined />} onClick={() => refetchCache()} loading={cacheLoading}>刷新状态</Button>
      </Space>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Statistic title="缓存 Key 总数" value={cacheStats?.totalKeys ?? 0} prefix={<DatabaseOutlined />} />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic title="缓存分类数" value={cacheStats?.prefixCounts ? Object.keys(cacheStats.prefixCounts).length : 0} />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic title="Redis 内存占用" value={cacheStats?.memoryUsed ?? '-'} />
        </Col>
      </Row>
      {cacheStats?.prefixCounts && Object.keys(cacheStats.prefixCounts).length > 0 ? (
        <Table
          dataSource={Object.entries(cacheStats.prefixCounts).map(([prefix, count]) => ({ key: prefix, prefix, count }))}
          columns={[
            { title: '缓存分类', dataIndex: 'prefix', key: 'prefix', render: (text: string) => <Tag color="blue">{text}</Tag> },
            { title: 'Key 数量', dataIndex: 'count', key: 'count', align: 'right' as const, render: (count: number) => <Typography.Text strong>{count}</Typography.Text> },
          ]}
          pagination={false} size="small"
        />
      ) : (
        <Empty description={cacheLoading ? '加载中...' : '暂无缓存数据，请先执行缓存预热'} />
      )}
    </Card>
  );
};

export default CacheTab;

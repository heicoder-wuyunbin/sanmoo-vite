import { DatabaseOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import {
  App, Breadcrumb, Button, Card, Col, Popconfirm, Row, Space, Statistic,
  Typography,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncMeiliSearch } from '@/services/blog/settings-api';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const MaintenanceSettings: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [syncLoading, setSyncLoading] = useState(false);

  const { data: syncInfo, isLoading: infoLoading, refetch: refetchInfo } = useQuery({
    queryKey: ['maintenanceSyncInfo'],
    queryFn: async () => {
      return {
        lastSyncTime: '-',
        articleCount: 0,
        indexStatus: 'unknown',
      };
    },
  });

  const handleSync = useCallback(async () => {
    setSyncLoading(true);
    try {
      const res = await syncMeiliSearch();
      message.success(`同步完成，共同步 ${res.data.count} 篇文章`);
      queryClient.invalidateQueries({ queryKey: ['maintenanceSyncInfo'] });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '同步失败');
    } finally {
      setSyncLoading(false);
    }
  }, [queryClient, message]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '系统配置' }, { title: '数据维护' }]} />
      </div>
      <Typography.Title level={3} style={{ margin: 0 }}>数据维护</Typography.Title>
      <Typography.Text type="secondary">搜索引擎同步与数据维护操作。</Typography.Text>
      <Card style={{ ...ADMIN_CARD_STYLE }}>
        <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          管理搜索引擎数据同步，确保搜索索引与数据库数据一致。
        </Typography.Text>
        <Space size="middle" wrap style={{ marginBottom: 24 }}>
          <Popconfirm
            title="确认同步"
            description="将 MySQL 中的所有已发布文章同步到 MeiliSearch 索引，确定继续吗？"
            onConfirm={handleSync}
            okText="确认同步"
            cancelText="取消"
          >
            <Button type="primary" icon={<SyncOutlined />} loading={syncLoading}>
              同步 MySQL 到 MeiliSearch
            </Button>
          </Popconfirm>
          <Button icon={<ReloadOutlined />} onClick={() => refetchInfo()} loading={infoLoading}>
            刷新状态
          </Button>
        </Space>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Statistic
              title="索引文章数"
              value={syncInfo?.articleCount ?? 0}
              prefix={<DatabaseOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="索引状态"
              value={syncInfo?.indexStatus === 'ready' ? '正常' : '未知'}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="最后同步"
              value={syncInfo?.lastSyncTime ?? '-'}
            />
          </Col>
        </Row>
        <Typography.Text type="secondary">
          提示：建议在首次配置 MeiliSearch 或文章批量更新后执行同步操作。
        </Typography.Text>
      </Card>
    </Space>
  );
};

export default MaintenanceSettings;

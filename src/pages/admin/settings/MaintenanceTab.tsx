import { DeleteOutlined, DatabaseOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  App, Button, Card, Col, Empty, Popconfirm, Row, Space, Statistic,
  Table, Tag, Typography,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

interface MaintenanceStats {
  tables: Array<{
    tableName: string;
    rowCount: number;
    dataSize: string;
    indexSize: string;
  }>;
  totalRows: number;
}

interface CleanupReport {
  tables: Array<{
    tableName: string;
    deleted: number;
    retainDays: number;
    cutoffDate: string;
  }>;
  totalDeleted: number;
  duration: number;
  success: boolean;
  message: string;
}

const tableNameMap: Record<string, string> = {
  't_access_log': '访问日志',
  't_error_log': '错误日志',
  't_search_history': '搜索历史',
  't_mp_browse_history': '小程序浏览历史',
  't_statistics_article_pv': 'PV统计',
};

const retentionDaysMap: Record<string, number> = {
  't_access_log': 90,
  't_error_log': 180,
  't_search_history': 90,
  't_mp_browse_history': 180,
  't_statistics_article_pv': 365,
};

const MaintenanceTab: React.FC = () => {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [cleaning, setCleaning] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<MaintenanceStats>({
    queryKey: ['maintenanceStats'],
    queryFn: async () => {
      const res = await fetch('/admin/maintenance/stats');
      if (!res.ok) throw new Error('获取统计失败');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 60000,
  });

  const handleCleanup = useCallback(async () => {
    setCleaning(true);
    try {
      const res = await fetch('/admin/maintenance/cleanup-logs', { method: 'POST' });
      if (!res.ok) {
        message.error('清理失败');
        return;
      }
      const json = await res.json();
      const report: CleanupReport = json.data;

      if (report.totalDeleted > 0) {
        modal.success({
          title: '清理完成',
          content: (
            <div>
              <Typography.Paragraph>{report.message}</Typography.Paragraph>
              <Typography.Paragraph>耗时：{report.duration} ms</Typography.Paragraph>
              {report.tables.length > 0 && (
                <Table
                  dataSource={report.tables}
                  columns={[
                    { title: '表', dataIndex: 'tableName', render: (t: string) => tableNameMap[t] || t },
                    { title: '删除条数', dataIndex: 'deleted', align: 'right' as const },
                    { title: '保留天数', dataIndex: 'retainDays' },
                  ]}
                  pagination={false}
                  size="small"
                />
              )}
            </div>
          ),
        });
      } else {
        message.info('暂无过期数据需要清理');
      }

      queryClient.invalidateQueries({ queryKey: ['maintenanceStats'] });
    } catch {
      message.error('清理失败，请检查服务状态');
    } finally {
      setCleaning(false);
    }
  }, [queryClient, message, modal]);

  return (
    <Card style={{ ...ADMIN_CARD_STYLE, marginBottom: 16 }}>
      <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        管理数据库日志表的保留策略与清理，自动清理任务每日凌晨 3:00 执行。
      </Typography.Text>
      <Space size="middle" wrap style={{ marginBottom: 24 }}>
        <Popconfirm
          title="确认清理"
          description="将清理超过保留期限的日志数据，确定继续吗？"
          onConfirm={handleCleanup}
          okText="确认清理"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="primary" danger icon={<DeleteOutlined />} loading={cleaning}>
            手动清理过期数据
          </Button>
        </Popconfirm>
        <Button icon={<ReloadOutlined />} onClick={() => refetchStats()} loading={statsLoading}>
          刷新统计
        </Button>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Statistic
            title="日志表总行数"
            value={stats?.totalRows ?? 0}
            prefix={<DatabaseOutlined />}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic title="监控表数量" value={stats?.tables?.length ?? 0} />
        </Col>
      </Row>

      {stats?.tables && stats.tables.length > 0 ? (
        <Table
          dataSource={stats.tables.map((t, idx) => ({ key: idx, ...t }))}
          columns={[
            {
              title: '表名',
              dataIndex: 'tableName',
              render: (t: string) => <Tag color="blue">{tableNameMap[t] || t}</Tag>,
            },
            {
              title: '行数',
              dataIndex: 'rowCount',
              align: 'right' as const,
              render: (v: number) => <Typography.Text strong>{v.toLocaleString()}</Typography.Text>,
            },
            {
              title: '保留策略',
              dataIndex: 'tableName',
              render: (t: string) => {
                const days = retentionDaysMap[t] || 90;
                return `${days} 天`;
              },
            },
            {
              title: '数据大小',
              dataIndex: 'dataSize',
              align: 'right' as const,
            },
            {
              title: '索引大小',
              dataIndex: 'indexSize',
              align: 'right' as const,
            },
          ]}
          pagination={false}
          size="small"
        />
      ) : (
        <Empty description={statsLoading ? '加载中...' : '暂无统计数据'} />
      )}

      <div style={{ marginTop: 16 }}>
        <Typography.Text type="secondary">
          保留策略：访问日志 90 天 | 错误日志 180 天 | 搜索历史 90 天 | 浏览历史 180 天 | PV统计 365 天
        </Typography.Text>
      </div>
    </Card>
  );
};

export default MaintenanceTab;
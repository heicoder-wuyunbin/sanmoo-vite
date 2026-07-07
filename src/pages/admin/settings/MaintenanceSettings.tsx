import { DatabaseOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import {
  App, Button, Card, Col, Popconfirm, Row, Space, Statistic,
  Typography, theme as antTheme,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncMeiliSearch } from '@/services/blog/settings-api';

const MaintenanceSettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
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
    <div className="maintenance-settings-container">
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
              数据维护
            </Typography.Title>
            <Typography.Text type="secondary">
              搜索引擎同步与数据维护操作，确保搜索索引与数据库数据一致。
            </Typography.Text>
          </Space>
        </div>

        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Card
            size="small"
            title="搜索引擎同步"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.1s both',
            }}
            headStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Typography.Text type="secondary">
                管理搜索引擎数据同步，确保搜索索引与数据库数据一致。
              </Typography.Text>
              <Space size="middle" wrap>
                <Popconfirm
                  title="确认同步"
                  description="将 MySQL 中的所有已发布文章同步到 MeiliSearch 索引，确定继续吗？"
                  onConfirm={handleSync}
                  okText="确认同步"
                  cancelText="取消"
                >
                  <Button
                    type="primary"
                    icon={<SyncOutlined />}
                    loading={syncLoading}
                    size="large"
                    style={{
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    同步 MySQL 到 MeiliSearch
                  </Button>
                </Popconfirm>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => refetchInfo()}
                  loading={infoLoading}
                  size="large"
                  style={{
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  刷新状态
                </Button>
              </Space>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                提示：建议在首次配置 MeiliSearch 或文章批量更新后执行同步操作。
              </Typography.Text>
            </Space>
          </Card>

          <Card
            size="small"
            title="同步状态"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.15s both',
            }}
            headStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="索引文章数"
                  value={syncInfo?.articleCount ?? 0}
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
                  title="索引状态"
                  value={syncInfo?.indexStatus === 'ready' ? '正常' : '未知'}
                  style={{
                    background: `${token.colorBgLayout}`,
                    padding: '16px',
                    borderRadius: token.borderRadiusLG,
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="最后同步"
                  value={syncInfo?.lastSyncTime ?? '-'}
                  style={{
                    background: `${token.colorBgLayout}`,
                    padding: '16px',
                    borderRadius: token.borderRadiusLG,
                  }}
                />
              </Col>
            </Row>
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
        .maintenance-settings-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default MaintenanceSettings;
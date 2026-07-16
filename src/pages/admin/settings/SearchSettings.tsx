import { SyncOutlined, ReloadOutlined, DatabaseOutlined } from '@ant-design/icons';
import {
  App, Button, Card, Col, Form, Input, Popconfirm, Row, Space, Statistic, Switch,
  Typography, theme as antTheme,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { fetchSearchConfig, updateSearchConfig, syncMeiliSearch, fetchMeiliSearchStats } from '@/services/blog/settings-api';
import type { SearchConfig } from '@/services/blog/types';

const SearchSettings: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const [form] = Form.useForm<SearchConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [syncInfo, setSyncInfo] = useState({
    lastSyncTime: '-',
    articleCount: 0,
    indexStatus: 'unknown',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchSearchConfig();
        form.setFieldsValue(res.data);
      } catch {
        message.error('加载搜索配置失败');
      } finally {
        setLoading(false);
      }
    };
    void load();
    void refetchInfo();
  }, [form, message]);

  const refetchInfo = async () => {
    setInfoLoading(true);
    try {
      const res = await fetchMeiliSearchStats();
      setSyncInfo({
        lastSyncTime: res.data.lastSyncTime,
        articleCount: res.data.articleCount,
        indexStatus: res.data.indexStatus,
      });
    } catch {
      setSyncInfo({
        lastSyncTime: '-',
        articleCount: 0,
        indexStatus: 'error',
      });
    } finally {
      setInfoLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      await updateSearchConfig(values);
      message.success('搜索配置保存成功');
    } catch {
      message.error('保存失败，请检查表单');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await syncMeiliSearch();
      message.success(`同步完成，共同步 ${res.data.count} 篇文章`);
      await refetchInfo();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '同步失败');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="search-settings-container">
      <Card
        loading={loading}
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
              搜索配置
            </Typography.Title>
            <Typography.Text type="secondary">
              配置 MeiliSearch 全文搜索服务与数据同步。
            </Typography.Text>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Card
            size="small"
            title="MeiliSearch 配置"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.1s both',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <Form.Item name="meilisearchHost" label="MeiliSearch 地址">
                <Input
                  placeholder="http://localhost:7700"
                  size="large"
                  style={{
                    borderRadius: token.borderRadiusLG,
                    transition: 'all 0.3s ease',
                  }}
                />
              </Form.Item>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="meilisearchApiKey" label="API Key">
                    <Input.Password
                      placeholder="MeiliSearch API Key"
                      size="large"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="meilisearchIndex" label="索引名称">
                    <Input
                      placeholder="articles"
                      size="large"
                      style={{
                        borderRadius: token.borderRadiusLG,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          </Card>

          <Card
            size="small"
            title="热门搜索"
            style={{
              marginTop: 24,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.15s both',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Form.Item
              name="hotSearchMode"
              label="真实热门搜索"
              tooltip="开启后根据用户搜索历史统计热门关键词；关闭时使用配置的热门搜索词"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Form.Item>
            <Form.Item name="hotSearchWords" label="热门搜索词（备用）">
              <Input.TextArea
                rows={3}
                placeholder='["java", "springboot", "mysql", "redis"]'
                style={{
                  borderRadius: token.borderRadiusLG,
                  transition: 'all 0.3s ease',
                }}
              />
            </Form.Item>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              关闭真实热门搜索时使用此处配置的备用热门词，格式为 JSON 数组。
            </Typography.Text>
          </Card>

          <Card
            size="small"
            title="数据同步"
            style={{
              marginTop: 24,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              animation: 'fadeInUp 0.4s ease-out 0.2s both',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
                    value={syncInfo?.indexStatus === 'healthy' ? '正常' : syncInfo?.indexStatus === 'error' ? '异常' : '未知'}
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
              <Typography.Text type="secondary">
                将 MySQL 中的所有已发布文章同步到 MeiliSearch 索引，建议在首次配置或文章批量更新后执行。
              </Typography.Text>
            </Space>
          </Card>

          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              justifyContent: 'flex-end',
              animation: 'fadeInUp 0.4s ease-out 0.3s both',
            }}
          >
            <Space>
              <Button size="large">取消</Button>
              <Button
                type="primary"
                size="large"
                loading={saving}
                onClick={handleSave}
                style={{
                  borderRadius: token.borderRadiusLG,
                  padding: '0 32px',
                }}
              >
                保存配置
              </Button>
            </Space>
          </div>
        </Form>
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
        .search-settings-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default SearchSettings;
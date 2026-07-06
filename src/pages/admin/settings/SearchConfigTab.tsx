import { App, Button, Card, Form, Input, Space, Switch, Typography } from 'antd';
import React, { useState } from 'react';
import { syncMeiliSearch } from '@/services/blog/api';
import type { SettingsTabProps } from './types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const SearchConfigTab: React.FC<SettingsTabProps> = ({ saveConfig, savingConfig }) => {
  const { message } = App.useApp();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await syncMeiliSearch();
      message.success(`同步完成，共同步 ${res.data.count} 篇文章`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '同步失败');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <Card style={{ ...ADMIN_CARD_STYLE, marginBottom: 16 }}>
      <Form.Item name={['uiConfig', 'hotSearchMode']} label="使用 MeiliSearch"
        tooltip="开启后使用 MeiliSearch 搜索引擎和真热门；关闭时使用内置搜索和配置的关键词" valuePropName="checked">
        <Switch checkedChildren="开启" unCheckedChildren="关闭" />
      </Form.Item>
      <Form.Item name={['uiConfig', 'hotSearchWords']} label="热门搜索词"
        extra='仅在关闭 MeiliSearch 模式下生效，输入数组格式的热门搜索词，如：["java", "springboot"]'>
        <Input.TextArea rows={3} placeholder='["java", "springboot", "mysql", "redis"]' />
      </Form.Item>
      <Form.Item name={['uiConfig', 'meilisearchHost']} label="MeiliSearch 地址">
        <Input placeholder="例如: http://localhost:7700" />
      </Form.Item>
      <Form.Item name={['uiConfig', 'meilisearchApiKey']} label="MeiliSearch API Key">
        <Input.Password placeholder="MeiliSearch 的 API Key" />
      </Form.Item>
      <Form.Item name={['uiConfig', 'meilisearchIndex']} label="MeiliSearch 索引名称">
        <Input placeholder="articles" />
      </Form.Item>
      <Form.Item label="数据同步">
        <Space wrap>
          <Button type="primary" loading={syncLoading} onClick={handleSync}>
            同步 MySQL 到 MeiliSearch
          </Button>
        </Space>
        <Typography.Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          将 MySQL 中的所有已发布文章同步到 MeiliSearch 索引，建议在首次配置或文章批量更新后执行
        </Typography.Text>
      </Form.Item>
      <Form.Item>
        <Button type="primary" loading={savingConfig === 'search'} onClick={() => saveConfig('search', ['uiConfig'])}>
          保存搜索配置
        </Button>
      </Form.Item>
    </Card>
  );
};

export default SearchConfigTab;

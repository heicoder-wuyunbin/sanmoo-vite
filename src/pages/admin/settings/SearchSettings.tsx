import { App, Breadcrumb, Button, Card, Form, Input, Select, Space, Switch, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSearchConfig, updateSearchConfig, syncMeiliSearch } from '@/services/blog/settings-api';
import type { SearchConfig } from '@/services/blog/types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const SearchSettings: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<SearchConfig>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

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
  }, [form, message]);

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
    } catch (error) {
      message.error(error instanceof Error ? error.message : '同步失败');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '系统配置' }, { title: '搜索配置' }]} />
      </div>
      <Typography.Title level={3} style={{ margin: 0 }}>搜索配置</Typography.Title>
      <Typography.Text type="secondary">配置搜索服务、推荐策略与热门搜索。</Typography.Text>
      <Card style={{ ...ADMIN_CARD_STYLE }} loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item name="recommendStrategy" label="推荐策略">
            <Select
              options={[
                { label: '规则推荐', value: 'rule' },
                { label: '加权推荐', value: 'weighted' },
                { label: '协同过滤', value: 'cf' },
              ]}
            />
          </Form.Item>
          <Form.Item name="searchEngine" label="搜索引擎">
            <Select
              options={[
                { label: '无', value: 'NONE' },
                { label: 'MeiliSearch', value: 'MEILISEARCH' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="hotSearchMode"
            label="使用 MeiliSearch"
            tooltip="开启后使用 MeiliSearch 搜索引擎和真热门；关闭时使用内置搜索和配置的关键词"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item
            name="hotSearchWords"
            label="热门搜索词"
            extra='仅在关闭 MeiliSearch 模式下生效，输入数组格式的热门搜索词，如：["java", "springboot"]'
          >
            <Input.TextArea rows={3} placeholder='["java", "springboot", "mysql", "redis"]' />
          </Form.Item>
          <Form.Item name="meilisearchHost" label="MeiliSearch 地址">
            <Input placeholder="例如: http://localhost:7700" />
          </Form.Item>
          <Form.Item name="meilisearchApiKey" label="MeiliSearch API Key">
            <Input.Password placeholder="MeiliSearch 的 API Key" />
          </Form.Item>
          <Form.Item name="meilisearchIndex" label="MeiliSearch 索引名称">
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
            <Button type="primary" loading={saving} onClick={handleSave}>
              保存搜索配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default SearchSettings;

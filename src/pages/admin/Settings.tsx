import { Link } from 'react-router-dom';
import { App, Breadcrumb, Button, Form, Space, Tabs, Typography, theme as antTheme } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '@/services/blog/api';
import CoreConfigTab from './settings/CoreConfigTab';
import PrivacyPolicyTab from './settings/PrivacyPolicyTab';
import SocialLinksTab from './settings/SocialLinksTab';
import SearchConfigTab from './settings/SearchConfigTab';
import StorageConfigTab from './settings/StorageConfigTab';
import EmailConfigTab from './settings/EmailConfigTab';
import CacheTab from './settings/CacheTab';
import type { SettingsFormValues } from './settings/types';

const configLabelMap: Record<string, string> = {
  core: '核心', privacy: '隐私政策', ui: '社交链接', search: '搜索', storage: '存储', email: '邮件',
};

const SettingsPage: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
  const [form] = Form.useForm<SettingsFormValues>();
  const [savingConfig, setSavingConfig] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    fetch('/admin/settings/export')
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success('配置导出成功');
      })
      .catch(() => {
        message.error('导出失败');
      });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string);
        const res = await fetch('/admin/settings/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          message.success('配置导入成功');
          window.location.reload();
        } else {
          message.error('导入失败');
        }
      } catch {
        message.error('无效的配置文件');
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const load = async () => {
      const res = await fetchSettings(true);
      const d = res.data;
      form.setFieldsValue({
        ...d,
        storageConfig: {
          uploadStrategy: 'LOCAL', uploadLocalDir: 'uploads', uploadLocalUrlPrefix: '/uploads/',
          uploadQiniuBucket: '', uploadQiniuDomain: '',
          uploadAliyunEndpoint: '', uploadAliyunBucket: '', uploadAliyunDomain: '',
          ...(d?.storageConfig || {}),
        },
        uiConfig: {
          ...(d?.uiConfig || {}),
          recommendStrategy: d?.uiConfig?.recommendStrategy || 'rule',
          searchEngine: d?.uiConfig?.searchEngine || 'NONE',
          hotSearchMode: d?.uiConfig?.hotSearchMode ?? false,
          hotSearchWords: d?.uiConfig?.hotSearchWords || '[]',
          meilisearchHost: d?.uiConfig?.meilisearchHost || '',
          meilisearchApiKey: d?.uiConfig?.meilisearchApiKey || '',
          meilisearchIndex: d?.uiConfig?.meilisearchIndex || 'articles',
        },
        emailConfig: {
          host: '', port: '', username: '', password: '', from: '', loginMfaEnabled: false,
          ...(d?.emailConfig || {}),
        },
      });
    };
    void load();
  }, [form]);

  const saveConfig = async (configKey: string, fieldPath: string[]) => {
    setSavingConfig(configKey);
    try {
      const values = await form.validateFields(fieldPath);
      await updateSettings(values);
      message.success(`${configLabelMap[configKey] || configKey}配置保存成功`);
    } catch {
      message.error('保存失败，请检查表单');
    } finally {
      setSavingConfig(null);
    }
  };

  const tabProps = { form, saveConfig, savingConfig };

  const tabItems = [
    { key: 'core', label: '核心配置', children: <CoreConfigTab {...tabProps} /> },
    { key: 'privacy', label: '隐私政策', children: <PrivacyPolicyTab {...tabProps} /> },
    { key: 'ui', label: '社交链接', children: <SocialLinksTab {...tabProps} /> },
    { key: 'search', label: '搜索配置', children: <SearchConfigTab {...tabProps} /> },
    { key: 'storage', label: '存储配置', children: <StorageConfigTab {...tabProps} /> },
    { key: 'email', label: '邮件配置', children: <EmailConfigTab {...tabProps} /> },
    { key: 'cache', label: '缓存管理', children: <CacheTab /> },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '博客设置' }]} />
      </div>
      <Typography.Title level={3} style={{ margin: 0 }}>博客设置</Typography.Title>
      <Typography.Text type="secondary">统一维护博客品牌、社交链接、存储策略与邮件能力。</Typography.Text>
      <div
        style={{
          padding: '16px 24px',
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorder}`,
        }}
      >
        <Typography.Text type="secondary" style={{ marginRight: 16 }}>配置迁移：</Typography.Text>
        <Space size={8}>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            导出配置
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            style={{ display: 'none' }}
            id="settings-import"
          />
          <Button icon={<UploadOutlined />} onClick={() => document.getElementById('settings-import')?.click()}>
            导入配置
          </Button>
        </Space>
      </div>
      <Form form={form} layout="vertical">
        <Tabs defaultActiveKey="core" items={tabItems} />
      </Form>
    </Space>
  );
};

export default SettingsPage;

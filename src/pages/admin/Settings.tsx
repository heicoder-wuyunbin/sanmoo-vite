import { Link, Outlet } from 'react-router-dom';
import { App, Breadcrumb, Button, Space, Typography, theme as antTheme } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();
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

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ title: <Link to="/admin">首页</Link> }, { title: '系统配置' }, { title: '设置' }]} />
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
      <Outlet />
    </Space>
  );
};

export default SettingsPage;

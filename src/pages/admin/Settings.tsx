import { Link, Outlet } from 'react-router-dom';
import { App, Breadcrumb, Button, Card, Space, Typography, theme as antTheme } from 'antd';
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
    <div className="settings-page-container">
      <div
        style={{
          marginBottom: 24,
          animation: 'fadeInUp 0.4s ease-out',
        }}
      >
        <Breadcrumb
          items={[
            { title: <Link to="/admin">首页</Link> },
            { title: '系统配置' },
          ]}
          style={{ marginBottom: 16 }}
        />
        <Space direction="vertical" size={8}>
          <Typography.Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            系统配置
          </Typography.Title>
          <Typography.Text type="secondary">
            统一管理博客配置、存储策略、邮件服务与系统维护。
          </Typography.Text>
        </Space>
      </div>

      <Card
        size="small"
        style={{
          marginBottom: 24,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: `${token.colorBgContainer}`,
          borderRadius: token.borderRadiusLG,
          animation: 'fadeInUp 0.4s ease-out 0.1s both',
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space align="center" size={16}>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            配置迁移
          </Typography.Text>
          <div style={{ flex: 1, height: 24, borderBottom: `1px dashed ${token.colorBorderSecondary}` }} />
          <Space size={8}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              size="middle"
            >
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
            <Button
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('settings-import')?.click()}
              size="middle"
              disabled={importing}
            >
              导入配置
            </Button>
          </Space>
        </Space>
      </Card>

      <div
        style={{
          animation: 'fadeInUp 0.4s ease-out 0.2s both',
        }}
      >
        <Outlet />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .settings-page-container {
          width: 100%;
          min-height: 100%;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
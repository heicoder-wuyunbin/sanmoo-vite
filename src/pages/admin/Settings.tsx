import { Link, Outlet } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import React from 'react';

const SettingsPage: React.FC = () => {
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
            { title: '站点设置' },
          ]}
        />
      </div>

      <div
        style={{
          animation: 'fadeInUp 0.4s ease-out 0.1s both',
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
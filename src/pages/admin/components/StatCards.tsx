import {
  FileTextOutlined,
  TagsOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { DashboardStats } from '@/services/blog/api';

interface Props {
  stats?: DashboardStats;
  loading: boolean;
}

// ─── 动画数值 Hook ───────────────────────────────────────────
function useAnimatedNumber(target: number, loading: boolean, duration = 800) {
  const [display, setDisplay] = useState(0);
  const cur = useRef(0);

  useEffect(() => {
    if (loading) return;
    const safe = Math.max(0, Number.isFinite(target) ? target : 0);
    const from = cur.current;
    const diff = safe - from;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + diff * eased);
      setDisplay(v);
      cur.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, loading, duration]);

  return display;
}

// ─── ProCard 组件 ────────────────────────────────────────────
interface ProCardProps {
  title: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
  color: string;
  footer?: React.ReactNode;
  suffix?: string;
}

const ProCard: React.FC<ProCardProps> = ({ title, value, loading, icon, color, footer, suffix }) => {
  const { token } = antTheme.useToken();
  const display = useAnimatedNumber(value, loading);

  return (
    <Card
      loading={loading}
      style={{
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadow,
        height: '100%',
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Typography.Text style={{ fontSize: 14, color: token.colorTextSecondary }}>
            {title}
          </Typography.Text>
          <div style={{ marginTop: 8 }}>
            <Statistic
              value={display}
              suffix={suffix}
              valueStyle={{ fontSize: 30, fontWeight: 600, color: token.colorText, lineHeight: 1.2 }}
            />
          </div>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
      {footer && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {footer}
        </div>
      )}
    </Card>
  );
};

// ─── 主组件 ─────────────────────────────────────────────────
const StatCards: React.FC<Props> = ({ stats, loading }) => {
  const { token } = antTheme.useToken();

  const unpublished =
    stats?.unpublishedArticleCount ??
    (stats?.articleCount ?? 0) - (stats?.publishedArticleCount ?? 0);

  const subTextStyle: React.CSSProperties = {
    fontSize: 13,
    color: token.colorTextSecondary,
  };

  return (
    <Row gutter={[16, 16]}>
      {/* 1. 文章总数 */}
      <Col xs={12} md={12} lg={6}>
        <ProCard
          title="文章总数"
          value={stats?.articleCount ?? 0}
          loading={loading}
          icon={<FileTextOutlined />}
          color="#1677ff"
          footer={
            <div style={{ display: 'flex', gap: 16, ...subTextStyle }}>
              <span>已发布 <strong style={{ color: token.colorSuccess }}>{stats?.publishedArticleCount ?? 0}</strong></span>
              <span>未发布 <strong style={{ color: token.colorWarning }}>{unpublished}</strong></span>
            </div>
          }
        />
      </Col>

      {/* 2. 分类 / 标签 / 专题 */}
      <Col xs={12} md={12} lg={6}>
        <ProCard
          title="分类数"
          value={stats?.categoryCount ?? 0}
          loading={loading}
          icon={<TagsOutlined />}
          color="#722ed1"
          footer={
            <div style={{ display: 'flex', gap: 16, ...subTextStyle }}>
              <span>标签 <strong style={{ color: token.colorPrimary }}>{stats?.tagCount ?? 0}</strong></span>
              <span>专题 <strong style={{ color: token.colorPrimary }}>{stats?.topicCount ?? 0}</strong></span>
            </div>
          }
        />
      </Col>

      {/* 3. 微信用户 */}
      <Col xs={12} md={12} lg={6}>
        <ProCard
          title="微信用户"
          value={stats?.mpUserCount ?? 0}
          loading={loading}
          icon={<TeamOutlined />}
          color="#13c2c2"
          footer={
            <div style={{ display: 'flex', gap: 16, ...subTextStyle }}>
              <span>今日新增 <strong style={{ color: token.colorSuccess }}>{stats?.todayMpUserCount ?? 0}</strong></span>
              <span>昨日新增 <strong style={{ color: token.colorTextSecondary }}>{stats?.yesterdayMpUserCount ?? 0}</strong></span>
            </div>
          }
        />
      </Col>

      {/* 4. 总阅读量 */}
      <Col xs={12} md={12} lg={6}>
        <ProCard
          title="总阅读量"
          value={stats?.totalReads ?? 0}
          loading={loading}
          icon={<EyeOutlined />}
          color="#fa8c16"
          footer={
            <div style={{ display: 'flex', gap: 16, ...subTextStyle }}>
              <span>访客 <strong style={{ color: token.colorText }}>{stats?.visitorCount ?? 0}</strong></span>
              <span>今日PV <strong style={{ color: token.colorSuccess }}>{stats?.todayPv ?? 0}</strong></span>
              <span>昨日PV <strong style={{ color: token.colorTextSecondary }}>{stats?.yesterdayPv ?? 0}</strong></span>
            </div>
          }
        />
      </Col>
    </Row>
  );
};

export default StatCards;

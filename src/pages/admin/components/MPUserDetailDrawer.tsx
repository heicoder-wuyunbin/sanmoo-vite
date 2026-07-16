/**
 * 微信用户详情抽屉
 * 包含基本信息、行为统计和三种雷达图（行为标签/兴趣/六边形画像）。
 */
import { RadarChartOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Radar } from '@ant-design/plots';
import {
  App,
  Avatar,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  fetchMPUserDetail,
  fetchMPUserProfile,
  refreshRadar,
} from '@/services/blog/mp-user-api';
import {
  type MPUserDetail,
  type MPUserProfile,
  type RadarData,
} from '@/services/blog/api';

interface Props {
  open: boolean;
  openid: string | null;
  onClose: () => void;
  onRefreshList: () => void;
}

/** 格式化停留时长 */
const formatStay = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
  return `${(seconds / 3600).toFixed(1)}小时`;
};

/** 通用雷达图配置 */
const radarAreaStyle = (fill: string) => ({ style: { fill, fillOpacity: 0.3 } });
const radarScale = { y: { min: 0, max: 100 } };
const radarAxis = { y: { grid: true, gridStroke: '#e5e5e5', label: false } };
const radarTooltip = { items: [{ channel: 'y', valueFormatter: (v: number) => `${v} 分` }] };

/** 维度标签配色（按分数高低） */
const dimColor = (score: number) => {
  if (score >= 80) return 'volcano';
  if (score >= 60) return 'orange';
  if (score >= 40) return 'blue';
  return 'default';
};

/** 统计维度展示区域样式 */
const dimListStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  padding: '16px 16px 8px',
  background: 'var(--ant-color-fill-quaternary, #fafafa)',
  borderRadius: 8,
  marginTop: 16,
};

const MPUserDetailDrawer: React.FC<Props> = ({ open, openid, onClose, onRefreshList }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<MPUserDetail | null>(null);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<MPUserProfile | null>(null);
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [refreshingTags, setRefreshingTags] = useState(false);
  const [refreshingInterest, setRefreshingInterest] = useState(false);
  const [refreshingHexagon, setRefreshingHexagon] = useState(false);

  // Drawer 打开时自动加载用户数据
  useEffect(() => {
    if (open && openid) {
      loadDetail(openid);
    }
  }, [open, openid]);

  const loadDetail = async (oid: string) => {
    setLoading(true);
    setDetail(null);
    setError(false);
    setProfile(null);
    setRadarData(null);
    try {
      const [detailRes, profileRes, radarRes] = await Promise.allSettled([
        fetchMPUserDetail(oid),
        fetchMPUserProfile(oid),
        refreshRadar(oid),
      ]);
      if (detailRes.status === 'fulfilled' && detailRes.value.data) {
        setDetail(detailRes.value.data as MPUserDetail);
      } else {
        setError(true);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value.data) {
        setProfile(profileRes.value.data as MPUserProfile);
      }
      if (radarRes.status === 'fulfilled' && radarRes.value.data) {
        const data = radarRes.value.data as RadarData;
        setRadarData(data);
        if (data.profile) setProfile(data.profile);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (type: 'tags' | 'interest' | 'hexagon') => {
    if (!detail) return;
    const setLoading = type === 'tags' ? setRefreshingTags : type === 'interest' ? setRefreshingInterest : setRefreshingHexagon;
    setLoading(true);
    try {
      const res = await refreshRadar(detail.openid);
      const data = res.data as RadarData;
      setRadarData(data);
      if (type === 'tags' && data.tags) setDetail({ ...detail, tags: data.tags });
      if (type === 'interest' && data.interests) setDetail({ ...detail, interests: data.interests });
      if (type === 'hexagon' && data.profile) setProfile(data.profile);
      message.success(`${type === 'tags' ? '行为标签' : type === 'interest' ? '兴趣' : '六边形画像'}雷达图刷新成功`);
      onRefreshList();
    } catch { /* interceptor */ }
    finally { setLoading(false); }
  };

  /** 渲染雷达图 + 下方统计维度 */
  const renderRadarChart = (
    data: { dimension: string; score: number; star: string }[],
    fill: string,
    emptyText: string,
    buttonLabel: string,
    refreshing: boolean,
    onRefresh: () => void,
  ) => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<ReloadOutlined />} loading={refreshing} onClick={onRefresh} size="small">
          {buttonLabel}
        </Button>
      </div>
      {data.length > 0 ? (
        <>
          <Radar data={data} xField="dimension" yField="score" colorField="star"
            area={radarAreaStyle(fill)} scale={radarScale} axis={radarAxis}
            style={{ height: 380 }} legend={false} tooltip={radarTooltip} />
          {/* 统计维度标签 */}
          <div style={dimListStyle}>
            <Typography.Text style={{ width: '100%', fontSize: 13, fontWeight: 600, color: 'var(--ant-color-text-secondary)', marginBottom: 4 }}>
              统计维度
            </Typography.Text>
            {data.map((d, i) => (
              <Tag key={i} color={dimColor(d.score)} style={{ margin: 0 }}>
                {d.dimension} <span style={{ fontWeight: 600 }}>{d.score}</span>
              </Tag>
            ))}
          </div>
        </>
      ) : (
        <Empty description={emptyText} />
      )}
    </div>
  );

  return (
    <Drawer
      title={<Space><Avatar src={detail?.avatar} icon={<UserOutlined />} /><span>{detail?.nickname || '用户详情'}</span></Space>}
      open={open}
      onClose={onClose}
      width={760}
      extra={<Button icon={<ReloadOutlined />} onClick={() => openid && loadDetail(openid)}>刷新</Button>}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : detail ? (
        <div>
          <Descriptions title="基本信息" column={2} size="small" bordered style={{ marginBottom: 24 }}>
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="OpenID">
              <Typography.Text copyable={{ text: detail.openid }} style={{ fontSize: 12 }}>{detail.openid}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="昵称">{detail.nickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="首次登录">{dayjs(detail.firstLoginTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="最近登录">{dayjs(detail.lastLoginTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          </Descriptions>
          <Descriptions title="行为统计" column={3} size="small" bordered style={{ marginBottom: 24 }}>
            <Descriptions.Item label="浏览次数"><Tag color="blue">{detail.viewCount}</Tag></Descriptions.Item>
            <Descriptions.Item label="收藏次数"><Tag color="purple">{detail.favoriteCount}</Tag></Descriptions.Item>
            <Descriptions.Item label="总停留时长"><Tag color="green">{formatStay(detail.totalStaySeconds)}</Tag></Descriptions.Item>
          </Descriptions>
          <Tabs defaultActiveKey="tags" items={[
            {
              key: 'tags',
              label: <span><RadarChartOutlined /> 行为标签雷达图</span>,
              children: renderRadarChart(
                (radarData?.tags || detail?.tags || []).map((t) => ({ dimension: t.tagName, score: t.score, star: '行为标签' })),
                'rgba(24, 144, 255, 0.25)', '暂无行为标签数据，请点击「刷新行为标签」',
                '刷新行为标签', refreshingTags, () => handleRefresh('tags'),
              ),
            },
            {
              key: 'interest',
              label: <span><RadarChartOutlined /> 兴趣雷达图</span>,
              children: renderRadarChart(
                (radarData?.interests || detail?.interests || []).map((i) => ({ dimension: i.dimensionName, score: i.score, star: '兴趣标签' })),
                'rgba(114, 46, 209, 0.25)', '暂无兴趣数据，请点击「刷新兴趣雷达」',
                '刷新兴趣雷达', refreshingInterest, () => handleRefresh('interest'),
              ),
            },
            {
              key: 'profile',
              label: <span><RadarChartOutlined /> 六边形画像</span>,
              children: renderRadarChart(
                (profile?.dimensions || []).map((d) => ({ dimension: d.dimension, score: d.score, star: '用户画像' })),
                'rgba(24, 144, 255, 0.25)', '暂无画像数据，请点击「刷新画像」',
                '刷新画像', refreshingHexagon, () => handleRefresh('hexagon'),
              ),
            },
          ]} />
        </div>
      ) : error ? (
        <Empty description="数据加载失败，请重试" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" onClick={() => openid && loadDetail(openid)}>重试</Button>
        </Empty>
      ) : (
        <Empty description="未找到用户数据" />
      )}
    </Drawer>
  );
};

export default MPUserDetailDrawer;

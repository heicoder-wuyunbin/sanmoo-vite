import { Link } from 'react-router-dom';
import { Breadcrumb, Col, Row, Table, Tag, Typography, theme as antTheme, Card, Space } from 'antd';
import React, { useState } from 'react';
import {
  useArticleReadStatistics,
  useCategoryReadStatistics,
  useCategoryStats,
  useContentTrend,
  useDashboardOverview,
  useHeatmapData,
  useMpUserGrowth,
  useTagReadStatistics,
  useTagStats,
  useTopicDist,
} from './hooks/useDashboardQueries';
import StatCards from './components/StatCards';
import TrendLineChart from './components/TrendLineChart';
import DistributionPieChart from './components/DistributionPieChart';
import TagColumnChart from './components/TagColumnChart';
import GitHubHeatmap from './components/GitHubHeatmap';
import type { ContentTrendItem } from '@/services/blog/api';

const DashboardPage: React.FC = () => {
  const { token } = antTheme.useToken();
  const [trendDays, setTrendDays] = useState(30);

  // ── 数据获取 ──
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: categoryStats = [], isLoading: categoryLoading } = useCategoryStats();
  const { data: tagStats = [], isLoading: tagLoading } = useTagStats();
  const { data: heatmapData = [], isLoading: heatmapLoading } = useHeatmapData();
  const { data: topicDist = [], isLoading: topicLoading } = useTopicDist();
  const { data: mpGrowth = [], isLoading: mpGrowthLoading } = useMpUserGrowth();
  const { data: categoryReadStats = [], isLoading: categoryReadLoading } = useCategoryReadStatistics();
  const { data: tagReadStats = [], isLoading: tagReadLoading } = useTagReadStatistics();
  const { data: contentTrend = [], isLoading: contentTrendLoading } = useContentTrend(trendDays);
  const { data: articleReadStats, isLoading: articleReadLoading } = useArticleReadStatistics(1, 10);

  const stats = overview?.stats;
  const pvList = overview?.pvList ?? [];

  const chartCardStyle: React.CSSProperties = {
    height: '100%',
    borderRadius: token.borderRadiusLG,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadow,
    backgroundColor: token.colorBgContainer,
  };

  const contentTrendChartData = contentTrend.map((item: ContentTrendItem) => ({
    date: item.date,
    pv: item.totalPv,
    articles: item.newArticles,
  }));

  return (
    <div style={{ padding: 0 }}>
      {/* ── 页头 ── */}
      <div style={{ marginBottom: 24 }}>
        <Breadcrumb
          items={[{ title: <Link to="/admin">首页</Link> }, { title: '仪表盘' }]}
        />
        <Typography.Title level={3} style={{ margin: '16px 0 0 0' }}>
          仪表盘
        </Typography.Title>
        <Typography.Text type="secondary">
          以更清晰的层级查看博客运营、内容分布与访问趋势。
        </Typography.Text>
      </div>

      {/* ── 统计卡片 ── */}
      <StatCards stats={stats} loading={overviewLoading} />

      {/* ── 第一行图表：PV 折线 + 分类饼图 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <TrendLineChart
            title="最近 7 天 PV"
            data={pvList}
            loading={overviewLoading}
            tooltipLabel="PV"
          />
        </Col>
        <Col xs={24} lg={12}>
          <DistributionPieChart
            title="文章分类统计"
            data={categoryStats}
            loading={categoryLoading}
          />
        </Col>
      </Row>

      {/* ── 第二行图表：标签柱状图 + 发布热力图 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <TagColumnChart title="文章标签统计" data={tagStats} loading={tagLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="近30天文章发布热力图"
            loading={heatmapLoading}
            style={chartCardStyle}
          >
            <div
              style={{
                height: 300,
                backgroundColor: token.colorBgLayout,
                padding: 24,
                borderRadius: token.borderRadius,
              }}
            >
              <GitHubHeatmap data={heatmapData} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── 第三行图表：专题饼图 + 微信用户增长 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <DistributionPieChart
            title="专题文章分布"
            data={topicDist}
            loading={topicLoading}
            colors={[
              token.colorPrimary,
              token.colorWarning,
              token.colorSuccess,
              token.colorError,
              token.colorInfo,
              token.colorPrimaryBg,
              token.colorWarningBg,
            ]}
          />
        </Col>
        <Col xs={24} lg={12}>
          <TrendLineChart
            title="近30天微信用户增长"
            data={mpGrowth}
            loading={mpGrowthLoading}
            color={token.colorWarning}
            tooltipLabel="新增"
          />
        </Col>
      </Row>

      {/* ── 第四行：内容热度趋势 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title="近30天内容热度趋势"
            loading={contentTrendLoading}
            style={chartCardStyle}
            extra={
              <Space>
                <Typography.Text type="secondary">时间范围：</Typography.Text>
                <Tag
                  color={trendDays === 7 ? 'blue' : 'default'}
                  onClick={() => setTrendDays(7)}
                  style={{ cursor: 'pointer' }}
                >
                  7天
                </Tag>
                <Tag
                  color={trendDays === 30 ? 'blue' : 'default'}
                  onClick={() => setTrendDays(30)}
                  style={{ cursor: 'pointer' }}
                >
                  30天
                </Tag>
                <Tag
                  color={trendDays === 90 ? 'blue' : 'default'}
                  onClick={() => setTrendDays(90)}
                  style={{ cursor: 'pointer' }}
                >
                  90天
                </Tag>
              </Space>
            }
          >
            <TrendLineChart
              title=""
              data={contentTrendChartData}
              loading={contentTrendLoading}
              tooltipLabel="PV"
              showLegend
              legendData={[
                { name: 'PV', color: token.colorPrimary },
                { name: '新文章', color: token.colorSuccess },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* ── 第五行：分类阅读量统计 + 标签阅读量统计 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="分类阅读量统计" loading={categoryReadLoading} style={chartCardStyle}>
            <Table
              dataSource={categoryReadStats}
              rowKey="id"
              pagination={false}
              scroll={{ y: 250 }}
              columns={[
                {
                  title: '分类名称',
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true,
                },
                {
                  title: '文章数',
                  dataIndex: 'articleCount',
                  key: 'articleCount',
                  align: 'right',
                },
                {
                  title: '总阅读量',
                  dataIndex: 'totalReads',
                  key: 'totalReads',
                  align: 'right',
                  render: (value: number) => (
                    <Tag color="blue">{value.toLocaleString()}</Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="标签阅读量统计" loading={tagReadLoading} style={chartCardStyle}>
            <Table
              dataSource={tagReadStats}
              rowKey="id"
              pagination={false}
              scroll={{ y: 250 }}
              columns={[
                {
                  title: '标签名称',
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true,
                },
                {
                  title: '文章数',
                  dataIndex: 'articleCount',
                  key: 'articleCount',
                  align: 'right',
                },
                {
                  title: '总阅读量',
                  dataIndex: 'totalReads',
                  key: 'totalReads',
                  align: 'right',
                  render: (value: number) => (
                    <Tag color="green">{value.toLocaleString()}</Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* ── 第六行：文章阅读量排行 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="文章阅读量排行 TOP 10" loading={articleReadLoading} style={chartCardStyle}>
            <Table
              dataSource={articleReadStats?.list || []}
              rowKey="id"
              pagination={false}
              scroll={{ y: 300 }}
              columns={[
                {
                  title: '排名',
                  key: 'rank',
                  width: 80,
                  align: 'center',
                  render: (_: unknown, __: unknown, index: number) => {
                    const rank = index + 1;
                    const colors = ['#f5222d', '#fa8c16', '#faad14'];
                    return (
                      <Tag
                        color={rank <= 3 ? colors[rank - 1] : 'default'}
                        style={{ minWidth: 28, textAlign: 'center' }}
                      >
                        {rank}
                      </Tag>
                    );
                  },
                },
                {
                  title: '文章标题',
                  dataIndex: 'title',
                  key: 'title',
                  ellipsis: true,
                },
                {
                  title: '分类',
                  dataIndex: 'categoryName',
                  key: 'categoryName',
                  width: 120,
                  ellipsis: true,
                },
                {
                  title: '阅读量',
                  dataIndex: 'readNum',
                  key: 'readNum',
                  width: 120,
                  align: 'right',
                  sorter: (a: any, b: any) => a.readNum - b.readNum,
                  render: (value: number) => (
                    <Tag color="blue">{value.toLocaleString()}</Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

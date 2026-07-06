import { Line } from '@ant-design/plots';
import { Card, theme as antTheme } from 'antd';
import React, { useMemo } from 'react';
import type { TimeSeriesData } from '../hooks/useDashboardQueries';

interface LegendItem {
  name: string;
  color: string;
}

interface Props {
  title: string;
  data: TimeSeriesData[] | Array<{ date: string; pv: number; articles: number }>;
  loading: boolean;
  color?: string;
  tooltipLabel?: string;
  height?: number;
  showLegend?: boolean;
  legendData?: LegendItem[];
}

const TrendLineChart: React.FC<Props> = ({
  title,
  data,
  loading,
  color,
  tooltipLabel = 'PV',
  height = 300,
  showLegend = false,
  legendData,
}) => {
  const { token } = antTheme.useToken();
  const lineColor = color ?? token.colorPrimary;

  const config = useMemo(() => {
    const hasMultiSeries = data.length > 0 && typeof data[0] === 'object' && 'pv' in data[0];
    
    if (hasMultiSeries) {
      const multiData = data as Array<{ date: string; pv: number; articles: number }>;
      return {
        data: multiData,
        xField: 'date',
        yField: ['pv', 'articles'],
        seriesField: 'type',
        smooth: true,
        color: legendData?.map((item) => item.color) || [token.colorPrimary, token.colorSuccess],
        point: {
          size: 4,
          shape: 'circle' as const,
        },
        tooltip: {
          title: '',
          items: [
            (datum: any) => ({
              name: `${datum.date.replace(/-/g, '/')}`,
              value: datum.pv !== undefined ? `PV: ${datum.pv}` : '',
            }),
          ],
        },
        legend: showLegend ? { position: 'bottom' } : false,
        animation: { appear: { animation: 'path-in', duration: 1000 } },
      };
    }

    return {
      data,
      xField: 'date',
      yField: 'count',
      smooth: true,
      color: lineColor,
      point: {
        size: 5,
        shape: 'circle' as const,
        style: { fill: token.colorBgContainer, stroke: lineColor, lineWidth: 2 },
      },
      tooltip: {
        title: '',
        items: [
          (datum: TimeSeriesData) => ({
            name: `${datum.date.replace(/-/g, '/')} ${tooltipLabel} ${datum.count}`,
            value: '',
          }),
        ],
      },
      animation: { appear: { animation: 'path-in', duration: 1000 } },
    };
  }, [data, lineColor, token, tooltipLabel, showLegend, legendData]);

  return (
    <Card
      title={title}
      loading={loading}
      style={{
        height: '100%',
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadow,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <div style={{ height }}>
        <Line {...config} />
      </div>
    </Card>
  );
};

export default TrendLineChart;

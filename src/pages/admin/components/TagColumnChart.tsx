import { Column } from '@ant-design/plots';
import { Card, theme as antTheme } from 'antd';
import React, { useMemo } from 'react';
import type { DistributionData } from '../hooks/useDashboardQueries';

interface Props {
  title: string;
  data: DistributionData[];
  loading: boolean;
  height?: number;
}

const TagColumnChart: React.FC<Props> = ({ title, data, loading, height = 400 }) => {
  const { token } = antTheme.useToken();

  const config = useMemo(
    () => ({
      data,
      xField: 'name',
      yField: 'value',
      color: token.colorSuccess,
      label: { position: 'top' as const },
      tooltip: {
        formatter: (d: DistributionData) => ({ name: d.name, value: d.value }),
      },
      animation: { appear: { animation: 'scale-in-y', duration: 1000 } },
    }),
    [data, token.colorSuccess],
  );

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
        <Column {...config} />
      </div>
    </Card>
  );
};

export default TagColumnChart;

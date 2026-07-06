import { Pie } from '@ant-design/plots';
import { Card, theme as antTheme } from 'antd';
import React, { useMemo } from 'react';
import type { DistributionData } from '../hooks/useDashboardQueries';

interface Props {
  title: string;
  data: DistributionData[];
  loading: boolean;
  colors?: string[];
  /** 数量单位，如 "篇" */
  unit?: string;
  height?: number;
}

const DistributionPieChart: React.FC<Props> = ({
  title,
  data,
  loading,
  colors,
  unit = '篇',
  height = 300,
}) => {
  const { token } = antTheme.useToken();

  const defaultColors = [
    token.colorPrimary,
    token.colorSuccess,
    token.colorWarning,
    token.colorError,
    token.colorInfo,
    token.colorPrimaryBg,
    token.colorSuccessBg,
  ];

  const config = useMemo(
    () => ({
      data,
      angleField: 'value',
      colorField: 'name',
      radius: 0.8,
      color: colors ?? defaultColors,
      legend: { position: 'right' as const },
      tooltip: {
        title: '',
        items: [
          (datum: DistributionData) => ({
            name: `${datum.name}：${datum.value} ${unit}`,
            value: '',
          }),
        ],
      },
      animation: { appear: { animation: 'fade-in', duration: 1000 } },
    }),
    [data, colors, unit], // eslint-disable-line react-hooks/exhaustive-deps
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
        <Pie {...config} />
      </div>
    </Card>
  );
};

export default DistributionPieChart;

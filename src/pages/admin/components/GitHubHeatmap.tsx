import React, { useMemo } from 'react';
import { theme as antTheme } from 'antd';

export type HeatmapData = { date: string; count: number };

const GitHubHeatmap: React.FC<{ data: HeatmapData[] }> = ({ data }) => {
  const { token } = antTheme.useToken();

  const colorMap = useMemo(
    () => [
      token.colorFillTertiary,
      `color-mix(in srgb, ${token.colorSuccess} 20%, ${token.colorFillTertiary})`,
      `color-mix(in srgb, ${token.colorSuccess} 40%, ${token.colorFillTertiary})`,
      `color-mix(in srgb, ${token.colorSuccess} 65%, ${token.colorFillTertiary})`,
      token.colorSuccess,
    ],
    [token],
  );

  const getColor = (count: number) => {
    if (count === 0) return colorMap[0];
    if (count === 1) return colorMap[1];
    if (count === 2) return colorMap[2];
    if (count === 3) return colorMap[3];
    return colorMap[4];
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'center' }}>
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {Array.from({ length: 6 }).map((_, col) => {
              const index = row * 6 + col;
              const item = data[index];
              if (!item) return null;
              return (
                <div
                  key={index}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: getColor(item.count),
                    borderRadius: token.borderRadiusSM,
                    border: `2px solid ${token.colorBgLayout}`,
                  }}
                  title={`${item.date}: ${item.count} 篇文章`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
        <span style={{ fontSize: '12px', color: token.colorTextTertiary, marginRight: 8 }}>少</span>
        {colorMap.map((color, index) => (
          <div
            key={color}
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: color,
              borderRadius: token.borderRadiusSM,
              border: `2px solid ${token.colorBgLayout}`,
              marginRight: 6,
            }}
            title={`${index}篇文章`}
          />
        ))}
        <span style={{ fontSize: '12px', color: token.colorTextTertiary }}>多</span>
      </div>
    </div>
  );
};

export default GitHubHeatmap;

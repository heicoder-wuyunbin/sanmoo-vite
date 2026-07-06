import { Card, Space, Tag, Typography, theme as antTheme } from 'antd';
import type { TagProps } from 'antd';
import React, { useMemo } from 'react';

interface HeroCardProps {
  tag?: {
    icon?: React.ReactNode;
    label: string;
    color?: TagProps['color'];
  };
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  gradient?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({
  tag,
  title,
  description,
  meta,
  actions,
  gradient,
}) => {
  const { token } = antTheme.useToken();
  const isDark = token.colorBgContainer === token.colorBgElevated || 
    parseInt(token.colorBgContainer.replace('#', ''), 16) < 0x888888;

  const lightGradient = useMemo(
    () => `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgElevated} 60%, ${token.colorWarningBg} 100%)`,
    [token],
  );
  const darkGradient = useMemo(
    () => `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 60%, ${token.colorWarningBg} 100%)`,
    [token],
  );
  const background = gradient || (isDark ? darkGradient : lightGradient);

  return (
    <Card
      style={{
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadow,
        background,
      }}
      styles={{ body: { padding: 28 } }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {tag && (
          <Tag
            icon={tag.icon}
            color={tag.color || 'blue'}
            style={{
              borderRadius: 999,
              paddingInline: 12,
              lineHeight: '26px',
              marginInlineEnd: 0,
              width: 'fit-content',
              background: token.colorBgContainer,
              fontWeight: 600,
            }}
          >
            {tag.label}
          </Tag>
        )}
        <div>
          <Typography.Title
            level={2}
            style={{
              margin: 0,
              color: token.colorText,
              fontSize: 32,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography.Title>
          {description && (
            <Typography.Paragraph
              style={{
                margin: '10px 0 0',
                maxWidth: 720,
                color: token.colorTextSecondary,
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              {description}
            </Typography.Paragraph>
          )}
        </div>
        {meta && <Space wrap size={[10, 10]}>{meta}</Space>}
        {actions && <Space wrap size={[10, 10]}>{actions}</Space>}
      </Space>
    </Card>
  );
};

export default HeroCard;

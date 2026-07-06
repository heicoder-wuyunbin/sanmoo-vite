import { Card } from 'antd';
import type { CardProps } from 'antd';
import React from 'react';
import { LAYOUT } from '@/styles/layout';

export interface AdminCardProps extends CardProps {
  bodyPadding?: number;
}

const AdminCard: React.FC<AdminCardProps> = ({
  bodyPadding = 22,
  styles,
  style,
  children,
  ...rest
}) => {
  const mergedStyle: React.CSSProperties = {
    borderRadius: LAYOUT.CARD_RADIUS,
    border: '1px solid var(--web-border)',
    boxShadow: 'var(--web-shadow)',
    ...style,
  };

  const mergedBodyStyle: React.CSSProperties = {
    padding: bodyPadding,
    ...styles?.body,
  };

  return (
    <Card style={mergedStyle} styles={{ ...styles, body: mergedBodyStyle }} {...rest}>
      {children}
    </Card>
  );
};

export default AdminCard;

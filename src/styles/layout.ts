export const LAYOUT = {
  SIDER_WIDTH: 300,
  CONTAINER_MAX_WIDTH: 1200,
  CARD_RADIUS: 20,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 200,
} as const;

export const ADMIN_CARD_STYLE: React.CSSProperties = {
  borderRadius: LAYOUT.CARD_RADIUS,
  border: '1px solid var(--web-border)',
  boxShadow: 'var(--web-shadow)',
};

export const ADMIN_CARD_BODY_STYLE: React.CSSProperties = {
  padding: 22,
};

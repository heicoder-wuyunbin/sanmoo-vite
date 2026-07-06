import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Typography, theme as antTheme, Space } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

type TaxonomyItem = {
  id: number;
  name: string;
  articleCount?: number;
};

type Props = {
  title?: string;
  items?: TaxonomyItem[];
  tags?: { id: number; name: string }[];
  baseUrl?: string;
  selectedId?: number;
  activeTagId?: number;
  primaryColor?: 'blue' | 'gold';
  activeColor?: string;
  inactiveColor?: string;
  maxVisible?: number;
  tagStyle?: React.CSSProperties;
  prefix?: string;
  onTagClick?: (tagId: number) => void;
};

const tagColors = [
  { bg: '#E6F7FF', border: '#91D5FF', text: '#1890FF' },
  { bg: '#F6FFED', border: '#B7EB8F', text: '#52C41A' },
  { bg: '#FFF7E6', border: '#FFD666', text: '#FA8C16' },
  { bg: '#FFF0F6', border: '#FFB3C1', text: '#EB2F96' },
  { bg: '#F9F0FF', border: '#D3ADF7', text: '#722ED1' },
  { bg: '#E6FFFB', border: '#87E8DE', text: '#13C2C2' },
];

const CollapsibleTags: React.FC<Props> = ({
  title,
  items = [],
  tags = [],
  baseUrl = '',
  selectedId,
  activeTagId,
  primaryColor = 'blue',
  activeColor,
  inactiveColor = 'default',
  maxVisible = 6,
  tagStyle,
  prefix = '',
  onTagClick,
}) => {
  const { token } = antTheme.useToken();
  const [expanded, setExpanded] = useState(false);

  const displayItems = items.length > 0 ? items : tags.map((tag) => ({ ...tag, articleCount: 0 }));
  const currentSelectedId = selectedId ?? activeTagId;
  const hasNavigation = baseUrl && baseUrl.length > 0;
  const hasCustomClick = typeof onTagClick === 'function';
  const hasMore = displayItems.length > maxVisible;

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  const renderTag = (item: TaxonomyItem, index: number) => {
    const isSelected = currentSelectedId === item.id;
    const colorStyle = getTagColor(index);

    const baseStyle: React.CSSProperties = {
      cursor: hasNavigation || hasCustomClick ? 'pointer' : 'default',
      borderRadius: 999,
      paddingInline: 10,
      lineHeight: '24px',
      fontWeight: isSelected ? 500 : 400,
      backgroundColor: isSelected ? undefined : colorStyle.bg,
      borderColor: isSelected ? undefined : colorStyle.border,
      color: isSelected ? undefined : colorStyle.text,
    };

    if (tagStyle) {
      Object.assign(baseStyle, tagStyle);
    }

    const tagContent = (
      <Tag
        style={baseStyle}
        color={isSelected ? (activeColor || primaryColor) : inactiveColor}
      >
        {prefix}{item.name}
        {typeof item.articleCount === 'number' && item.articleCount > 0 && (
          <span style={{ marginLeft: 4, opacity: 0.7 }}>
            · {item.articleCount}
          </span>
        )}
      </Tag>
    );

    if (hasNavigation) {
      return (
        <Link key={item.id} to={`${baseUrl}/${item.id}`} style={{ textDecoration: 'none' }}>
          {tagContent}
        </Link>
      );
    }

    if (hasCustomClick) {
      return (
        <button
          key={item.id}
          onClick={() => onTagClick?.(item.id)}
          style={{ display: 'inline-block', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {tagContent}
        </button>
      );
    }

    return <span key={item.id}>{tagContent}</span>;
  };

  const displayedItems = expanded ? displayItems : displayItems.slice(0, maxVisible);

  if (!hasNavigation && !title) {
    return (
      <Space wrap size={[6, 6]}>
        {displayedItems.map((item, index) => renderTag(item, index))}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            aria-label={`显示更多标签，还有 ${displayItems.length - maxVisible} 个`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: token.colorTextTertiary,
              fontSize: 12,
              padding: '4px 8px',
            }}
          >
            +{displayItems.length - maxVisible}
          </button>
        )}
      </Space>
    );
  }

  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        padding: 16,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Typography.Text strong style={{ color: token.colorText, fontSize: 14 }}>
          {title}
        </Typography.Text>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? '收起标签' : '展开更多标签'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: token.colorTextTertiary,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              padding: 4,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = token.colorBgTextHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            {expanded ? (
                  <>
                    <ArrowUpOutlined style={{ fontSize: 14 }} aria-hidden="true" />
                    收起
                  </>
                ) : (
                  <>
                    <ArrowDownOutlined style={{ fontSize: 14 }} aria-hidden="true" />
                    展开
                  </>
                )}
          </button>
        )}
      </div>
      <Space wrap size={[8, 8]} style={{ width: '100%' }}>
        {hasNavigation && (
          <Link to={baseUrl} style={{ textDecoration: 'none' }}>
            <Tag
              color={!currentSelectedId ? primaryColor : 'default'}
              style={{
                cursor: 'pointer',
                paddingInline: 12,
                lineHeight: '26px',
                borderRadius: 999,
                fontWeight: !currentSelectedId ? 500 : 400,
              }}
            >
              全部
            </Tag>
          </Link>
        )}
        {displayedItems.map((item, index) => renderTag(item, index))}
        {hasMore && !expanded && (
          <span style={{ color: token.colorTextTertiary, fontSize: 12, padding: '4px 12px' }}>
            +{displayItems.length - maxVisible} 个
          </span>
        )}
      </Space>
    </div>
  );
};

export default CollapsibleTags;

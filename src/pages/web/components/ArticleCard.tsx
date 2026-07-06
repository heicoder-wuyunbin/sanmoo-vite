import { ArrowRightOutlined, FireOutlined } from '@ant-design/icons';
import { Card, Space, Tag, Typography, theme as antTheme } from 'antd';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleMetaTags from './ArticleMetaTags';

export interface ArticleItem {
  id: number;
  title: string;
  description?: string;
  createTime: string;
  readNum: number;
  categoryName?: string;
  tags: { id: number; name: string }[];
  isTop?: boolean;
  titleImage?: string;
}

type CardStyle = 'normal' | 'featured' | 'spotlight';

interface Props {
  article: ArticleItem;
  style?: CardStyle;
  maxTags?: number;
  showButton?: boolean;
}

const ArticleCard: React.FC<Props> = ({
  article,
  style = 'normal',
  maxTags = 4,
  showButton = true,
}) => {
  const { token } = antTheme.useToken();
  const [isHovered, setIsHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      borderRadius: token.borderRadiusLG,
      background: token.colorBgContainer,
      transition: 'box-shadow 0.24s cubic-bezier(0.645, 0.045, 0.355, 1), transform 0.24s cubic-bezier(0.645, 0.045, 0.355, 1)',
      cursor: 'pointer',
      boxShadow: isHovered ? token.boxShadowSecondary : 'none',
      transform: isHovered ? 'translateY(-2px)' : 'none',
    }),
    [token, isHovered],
  );

  const metaTagStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: 999,
      paddingInline: 10,
      lineHeight: '26px',
      marginInlineEnd: 0,
    }),
    [],
  );

  const clampParagraphStyle = useMemo<React.CSSProperties>(
    () => ({
      marginBottom: 0,
      color: token.colorTextSecondary,
      display: '-webkit-box',
      WebkitLineClamp: style === 'featured' ? undefined : 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      transition: 'color 0.24s ease',
    }),
    [token, style],
  );

  const featuredInnerStyle = useMemo<React.CSSProperties>(
    () => ({
      background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorPrimaryBg} 100%)`,
      transition: 'background 0.24s ease',
    }),
    [token],
  );

  const linkStyle = useMemo<React.CSSProperties>(
    () => ({
      display: 'block',
      color: 'inherit',
      textDecoration: 'none',
    }),
    [],
  );

  const titleStyle = useMemo<React.CSSProperties>(
    () => ({
      margin: 0,
      color: isHovered ? token.colorPrimary : token.colorTextHeading,
      transition: 'color 0.24s ease',
      textWrap: 'balance',
    }),
    [token, isHovered],
  );

  const buttonLinkStyle = useMemo<React.CSSProperties>(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: buttonHovered ? 12 : 8,
      color: token.colorPrimary,
      fontSize: 14,
      fontWeight: 500,
      transition: 'gap 0.24s cubic-bezier(0.645, 0.045, 0.355, 1)',
    }),
    [token, buttonHovered],
  );

  if (style === 'featured') {
    return (
      <Card
        style={{
          ...cardStyle,
          boxShadow: token.boxShadowSecondary,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        styles={{ body: { padding: 0 } }}
      >
        <Link to={`/article/${article.id}`} style={linkStyle}>
          <div style={{ padding: 28, ...featuredInnerStyle }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Tag
                color="red"
                icon={<FireOutlined aria-hidden="true" />}
                style={{ ...metaTagStyle, width: 'fit-content', cursor: 'default' }}
              >
                推荐阅读
              </Tag>
              {article.titleImage ? (
                <div style={{ borderRadius: token.borderRadius, overflow: 'hidden' }}>
                  <img
                    src={article.titleImage}
                    alt={article.title}
                    width="100%"
                    height="260"
                    style={{
                      width: '100%',
                      height: 260,
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : null}
              <div>
                <Typography.Title
                  level={2}
                  style={{
                    margin: 0,
                    ...titleStyle,
                    fontSize: 30,
                  }}
                >
                  {article.title}
                </Typography.Title>
                <Typography.Paragraph
                  style={{
                    margin: '12px 0 0',
                    maxWidth: 760,
                    color: isHovered ? token.colorText : token.colorTextSecondary,
                    fontSize: 15,
                    transition: 'color 0.24s ease',
                  }}
                >
                  {article.description || '优先阅读这篇内容，快速把握当前阶段最值得关注的技术主题。'}
                </Typography.Paragraph>
              </div>
              <ArticleMetaTags meta={article} maxTags={5} />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: isHovered ? 12 : 8,
                  color: token.colorPrimary,
                  fontSize: 15,
                  fontWeight: 600,
                  transition: 'gap 0.24s cubic-bezier(0.645, 0.045, 0.355, 1)',
                }}
              >
                阅读全文
                <ArrowRightOutlined />
              </span>
            </Space>
          </div>
        </Link>
      </Card>
    );
  }

  if (style === 'spotlight') {
    return (
      <Card
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        styles={{ body: { padding: 22 } }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Tag
            color="blue"
            style={{ ...metaTagStyle, width: 'fit-content', cursor: 'default' }}
          >
            延伸阅读
          </Tag>
          <Typography.Title level={4} style={{ margin: 0, ...titleStyle }}>
            <Link to={`/article/${article.id}`} style={{ color: 'inherit' }}>
              {article.title}
            </Link>
          </Typography.Title>
          <Typography.Paragraph style={clampParagraphStyle}>
            {article.description || '继续探索这一主题下的代表性文章与实践内容。'}
          </Typography.Paragraph>
          <ArticleMetaTags meta={article} maxTags={3} />
          <Link
            to={`/article/${article.id}`}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            style={{
              color: token.colorPrimary,
              display: 'inline-flex',
              alignItems: 'center',
              gap: buttonHovered ? 10 : 6,
              fontWeight: 600,
              transition: 'gap 0.24s cubic-bezier(0.645, 0.045, 0.355, 1)',
            }}
          >
            继续阅读
            <ArrowRightOutlined aria-hidden="true" />
          </Link>
        </Space>
      </Card>
    );
  }

  return (
    <Link to={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
      <Card
        style={{
          ...cardStyle,
          borderLeft: `4px solid ${isHovered ? token.colorPrimary : `color-mix(in srgb, ${token.colorPrimary} 85%, transparent)`}`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        styles={{ body: { padding: 22 } }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0, ...titleStyle }}>
              {article.title}
            </Typography.Title>
            <Typography.Paragraph
              style={{
                ...clampParagraphStyle,
                marginTop: 10,
                color: isHovered ? token.colorText : token.colorTextSecondary,
              }}
            >
              {article.description || '暂无摘要，点击进入阅读全文。'}
            </Typography.Paragraph>
          </div>
          <ArticleMetaTags meta={article} maxTags={maxTags} />
          {showButton && (
            <span
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
              style={buttonLinkStyle}
            >
              阅读全文
              <ArrowRightOutlined />
            </span>
          )}
        </Space>
      </Card>
    </Link>
  );
};

export default ArticleCard;

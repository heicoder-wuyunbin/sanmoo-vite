import { LeftOutlined, RightOutlined, ThunderboltOutlined, HeartOutlined, HeartFilled, FontSizeOutlined, ArrowUpOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { App, Button, Card, Empty, Space, Spin, Tag, Typography, theme as antTheme } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchArticleDetail, fetchRelatedArticles, likeArticle, fetchRandomArticle, type WebArticleDetail, type ArticleItem } from '@/services/blog/api';
import WebShell from '@/pages/web/components/WebShell';
import TableOfContents from '@/pages/web/components/TableOfContents';
import Breadcrumb from '@/pages/web/components/Breadcrumb';
import Image from '@/components/Image';
import ImageLightbox from '@/pages/web/components/ImageLightbox';
import { useQuery } from '@tanstack/react-query';
import { addFavorite, removeFavorite, isFavorite, addHistory } from '@/services/local/localStorage';
import { copyToClipboard } from '@/utils/clipboard';
import './articleDetail.css';

type FontSize = 'small' | 'medium' | 'large';

const FONT_SIZE_MAP: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 18,
};

const READ_POSITION_KEY = 'article-read-position';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams();
  const { message: antdMessage } = App.useApp();
  const { token } = antTheme.useToken();
  const [progress, setProgress] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [showBackTop, setShowBackTop] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  // 灯箱相关状态
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadow,
      background: token.colorBgContainer,
    }),
    [token],
  );

  const articleId = Number(id);

  const { data: articleData, isLoading, error } = useQuery<WebArticleDetail>({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const res = await fetchArticleDetail(articleId);
      return res.data;
    },
    enabled: !Number.isNaN(articleId) && articleId > 0,
  });

  const article = articleData?.article;
  const toc = articleData?.toc || [];

  const { data: relatedArticles } = useQuery<ArticleItem[]>({
    queryKey: ['relatedArticles', articleId],
    queryFn: async () => {
      const res = await fetchRelatedArticles(articleId, 6);
      return res.data || [];
    },
    enabled: !Number.isNaN(articleId) && articleId > 0 && !isLoading,
  });

  useEffect(() => {
    if (error) {
      antdMessage.error('加载文章详情失败');
    }
  }, [error, antdMessage]);

  useEffect(() => {
    if (!article) return;
    setIsFavorited(isFavorite(article.id));
    setLikeCount(article.likeNum || 0);
    addHistory({
      id: article.id,
      title: article.title,
      titleImage: article.titleImage,
      description: article.description,
      content: '',
      createTime: article.createTime,
      updateTime: article.updateTime,
      readNum: article.readNum,
      isTop: article.isTop,
      isPublished: article.isPublished,
      categoryId: article.categoryId,
      categoryName: article.categoryName,
      tags: article.tags || [],
      topics: article.topics,
    });
  }, [article]);

  const handleLike = async () => {
    if (!article || hasLiked) return;
    try {
      const res = await likeArticle(article.id);
      setLikeCount(res.data.likeNum);
      setHasLiked(true);
      antdMessage.success('感谢点赞 ❤️');
    } catch {
      antdMessage.error('点赞失败，请稍后重试');
    }
  };

  const handleShare = async () => {
    if (!article) return;
    const shareUrl = `${window.location.origin}/article/${article.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.description || article.title,
          url: shareUrl,
        });
      } else {
        const success = await copyToClipboard(shareUrl);
        if (success) {
          antdMessage.success('链接已复制到剪贴板');
        }
      }
    } catch {
      const success = await copyToClipboard(shareUrl);
      if (success) {
        antdMessage.success('链接已复制到剪贴板');
      }
    }
  };

  const handleFavorite = () => {
    if (!article) return;
    if (isFavorited) {
      removeFavorite(article.id);
      setIsFavorited(false);
      antdMessage.success('已取消书签');
    } else {
      addFavorite({
        id: article.id,
        title: article.title,
        titleImage: article.titleImage,
        description: article.description,
        content: '',
        createTime: article.createTime,
        updateTime: article.updateTime,
        readNum: article.readNum,
        isTop: article.isTop,
        isPublished: article.isPublished,
        categoryId: article.categoryId,
        categoryName: article.categoryName,
        tags: article.tags || [],
        topics: article.topics,
      });
      setIsFavorited(true);
      antdMessage.success('已添加书签');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedFontSize = localStorage.getItem('article-font-size') as FontSize;
    if (savedFontSize && FONT_SIZE_MAP[savedFontSize]) {
      setFontSize(savedFontSize);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('article-font-size', fontSize);
    const mdBody = document.querySelector('.md-body');
    if (mdBody) {
      (mdBody as HTMLElement).style.fontSize = `${FONT_SIZE_MAP[fontSize]}px`;
    }
  }, [fontSize]);

  useEffect(() => {
    if (!article || Number.isNaN(articleId)) return;
    const savedPositions = localStorage.getItem(READ_POSITION_KEY);
    if (savedPositions) {
      try {
        const positions = JSON.parse(savedPositions) as Record<string, number>;
        const savedPosition = positions[articleId.toString()];
        if (savedPosition && savedPosition > 0) {
          setTimeout(() => {
            window.scrollTo({ top: savedPosition, behavior: 'smooth' });
          }, 500);
        }
      } catch {
        // ignore parse error
      }
    }
  }, [article, articleId]);

  useEffect(() => {
    if (Number.isNaN(articleId)) return;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        try {
          const savedPositions = localStorage.getItem(READ_POSITION_KEY);
          const positions = savedPositions ? JSON.parse(savedPositions) as Record<string, number> : {};
          positions[articleId.toString()] = scrollTop;
          localStorage.setItem(READ_POSITION_KEY, JSON.stringify(positions));
        } catch {
          // ignore storage error
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!article) return;

    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.md-code-block');
      codeBlocks.forEach((block) => {
        const header = block.querySelector('.md-code-header');
        const codeBody = block.querySelector('.md-code-body');
        if (!header || !codeBody) return;

        if (header.querySelector('.md-code-copy-btn')) return;

        const codeLines = codeBody.querySelectorAll('.md-code-line');
        const codeText = Array.from(codeLines)
          .map((line) => (line as HTMLElement).textContent || '')
          .join('\n');

        const copyBtn = document.createElement('button');
        copyBtn.className = 'md-code-copy-btn';
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span>复制</span>
        `;

        copyBtn.addEventListener('click', async () => {
          const success = await copyToClipboard(codeText);
          if (success) {
            copyBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>已复制</span>
            `;
            setTimeout(() => {
              copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                <span>复制</span>
              `;
            }, 2000);
          } else {
            antdMessage.error('复制失败，请手动复制');
          }
        });

        header.appendChild(copyBtn);
      });
    };

    const observer = new MutationObserver(addCopyButtons);
    const mdBody = document.querySelector('.md-body');
    if (mdBody) {
      observer.observe(mdBody, { childList: true, subtree: true });
    }

    setTimeout(addCopyButtons, 100);

    // 图片灯箱处理
    const addImageLightbox = () => {
      const images = document.querySelectorAll('.md-body .md-img');
      const imageSrcs: string[] = [];
      images.forEach((img, index) => {
        const src = (img as HTMLImageElement).src;
        imageSrcs.push(src);
        img.addEventListener('click', () => {
          setLightboxImage(src);
          setLightboxImages(imageSrcs);
          setLightboxIndex(index);
          setLightboxVisible(true);
        });
        (img as HTMLImageElement).style.cursor = 'zoom-in';
      });
    };

    setTimeout(addImageLightbox, 200);

    return () => {
      observer.disconnect();
    };
  }, [article]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const readingTime = useMemo(() => {
    if (!article?.content) return 0;
    const chineseChars = article.content.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const englishWords = article.content.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(Boolean).length;
    const totalWords = chineseChars + englishWords;
    return Math.ceil(totalWords / 500);
  }, [article?.content]);

  const wordCount = useMemo(() => {
    if (!article?.content) return 0;
    return article.content.length;
  }, [article?.content]);

  return (
    <>
      {article && (
        <Helmet>
          <title>{article.title} - Sanmoo Blog</title>
          <meta name="description" content={article.description || article.title} />
          <meta name="keywords" content={article.tags?.map(t => t.name).join(', ') || ''} />
          <link rel="canonical" href={`${window.location.origin}/article/${article.id}`} />
          <meta property="og:title" content={article.title} />
          <meta property="og:description" content={article.description || article.title} />
          <meta property="og:url" content={`${window.location.origin}/article/${article.id}`} />
          <meta property="og:image" content={article.titleImage || ''} />
          <meta property="og:type" content="article" />
          <meta property="og:article:published_time" content={dayjs(article.createTime).format('YYYY-MM-DD')} />
          <meta property="og:article:modified_time" content={dayjs(article.updateTime).format('YYYY-MM-DD')} />
          <meta property="og:article:author" content="Sanmoo" />
          <meta name="twitter:title" content={article.title} />
          <meta name="twitter:description" content={article.description || article.title} />
          <meta name="twitter:image" content={article.titleImage || ''} />
          <meta name="twitter:card" content="summary_large_image" />
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: article.title,
              description: article.description || article.title,
              image: article.titleImage || '',
              datePublished: dayjs(article.createTime).format('YYYY-MM-DD'),
              dateModified: dayjs(article.updateTime).format('YYYY-MM-DD'),
              author: {
                '@type': 'Person',
                name: 'Sanmoo',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Sanmoo Blog',
                logo: {
                  '@type': 'ImageObject',
                  url: `${window.location.origin}/vite.svg`,
                },
              },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: '首页',
                    item: `${window.location.origin}`,
                  },
                  article.categoryName ? {
                    '@type': 'ListItem',
                    position: 2,
                    name: article.categoryName,
                    item: `${window.location.origin}/categories/${article.categoryId}`,
                  } : null,
                  {
                    '@type': 'ListItem',
                    position: article.categoryName ? 3 : 2,
                    name: article.title,
                    item: `${window.location.origin}/article/${article.id}`,
                  },
                ].filter(Boolean),
              },
            })}
          </script>
        </Helmet>
      )}
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <WebShell hideSidebar>
        <div style={{ display: 'flex', gap: 24, maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Card
              style={{
                ...cardStyle,
              }}
              styles={{ body: { padding: 28 } }}
            >
              <Spin spinning={isLoading}>
                {!article ? (
                  <Empty description="文章不存在" />
                ) : (
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Breadcrumb items={[
                      { label: '首页', path: '/' },
                      article.categoryName ? { label: article.categoryName, path: `/categories/${article.categoryId}` } : null,
                      { label: article.title, path: `/article/${article.id}` },
                    ].filter(Boolean) as any} />
                    {article.titleImage ? (
                      <Image
                        src={article.titleImage}
                        alt={article.title}
                        style={{
                          width: '100%',
                          maxHeight: 360,
                          objectFit: 'cover',
                          borderRadius: token.borderRadiusLG,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        lazy
                      />
                    ) : null}
                    <Tag color="blue" style={{ width: 'fit-content', borderRadius: 999 }}>
                      技术文章
                    </Tag>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Typography.Title level={2} style={{ margin: 0, color: token.colorText }}>
                        {article.title}
                      </Typography.Title>
                      <Space size={4}>
                        <Button
                          type="text"
                          icon={<FontSizeOutlined />}
                          onClick={() => setFontSize('small')}
                          style={{
                            color: fontSize === 'small' ? token.colorPrimary : token.colorTextSecondary,
                            fontSize: 14,
                            padding: 4,
                            border: fontSize === 'small' ? `1px solid ${token.colorPrimary}` : 'none',
                            borderRadius: 6,
                          }}
                        />
                        <Button
                          type="text"
                          icon={<FontSizeOutlined />}
                          onClick={() => setFontSize('medium')}
                          style={{
                            color: fontSize === 'medium' ? token.colorPrimary : token.colorTextSecondary,
                            fontSize: 18,
                            padding: 4,
                            border: fontSize === 'medium' ? `1px solid ${token.colorPrimary}` : 'none',
                            borderRadius: 6,
                          }}
                        />
                        <Button
                          type="text"
                          icon={<FontSizeOutlined />}
                          onClick={() => setFontSize('large')}
                          style={{
                            color: fontSize === 'large' ? token.colorPrimary : token.colorTextSecondary,
                            fontSize: 22,
                            padding: 4,
                            border: fontSize === 'large' ? `1px solid ${token.colorPrimary}` : 'none',
                            borderRadius: 6,
                          }}
                        />
                      </Space>
                      <Button
                        type="text"
                        icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
                        onClick={handleFavorite}
                        style={{
                          color: isFavorited ? '#ff4d4f' : token.colorTextSecondary,
                          fontSize: 24,
                          padding: 0,
                        }}
                      />
                    </div>
                    {article.description ? (
                      <Typography.Paragraph
                        type="secondary"
                        style={{ marginTop: -6, marginBottom: 0, fontSize: 15, lineHeight: 1.8 }}
                      >
                        {article.description}
                      </Typography.Paragraph>
                    ) : null}
                    <Space wrap size={[8, 8]}>
                      <Tag
                        style={{
                          backgroundColor: '#E6F7FF',
                          borderColor: '#91D5FF',
                          color: '#1890FF',
                          borderRadius: 999,
                          paddingInline: 12,
                          fontWeight: 500,
                        }}
                      >
                        {dayjs(article.createTime).format('YYYY-MM-DD HH:mm')}
                      </Tag>
                      <Tag
                        style={{
                          backgroundColor: '#F6FFED',
                          borderColor: '#B7EB8F',
                          color: '#52C41A',
                          borderRadius: 999,
                          paddingInline: 12,
                          fontWeight: 500,
                        }}
                      >
                        阅读 {article.readNum ?? 0}
                      </Tag>
                      {readingTime > 0 && (
                        <Tag
                          style={{
                            backgroundColor: '#F9F0FF',
                            borderColor: '#D3ADF7',
                            color: '#722ED1',
                            borderRadius: 999,
                            paddingInline: 12,
                            fontWeight: 500,
                          }}
                        >
                          {readingTime} 分钟阅读
                        </Tag>
                      )}
                      {wordCount > 0 && (
                        <Tag
                          style={{
                            backgroundColor: '#FFF0F6',
                            borderColor: '#FFB3C1',
                            color: '#EB2F96',
                            borderRadius: 999,
                            paddingInline: 12,
                            fontWeight: 500,
                          }}
                        >
                          {wordCount.toLocaleString()} 字
                        </Tag>
                      )}
                      {article.categoryName ? (
                        <Tag
                          style={{
                            backgroundColor: '#FFF7E6',
                            borderColor: '#FFD666',
                            color: '#FA8C16',
                            borderRadius: 999,
                            paddingInline: 12,
                            fontWeight: 500,
                          }}
                        >
                          {article.categoryName}
                        </Tag>
                      ) : null}
                      {article.tags?.map((tag, index) => {
                        const tagColors = [
                          { bg: '#FFF0F6', border: '#FFB3C1', text: '#EB2F96' },
                          { bg: '#F9F0FF', border: '#D3ADF7', text: '#722ED1' },
                          { bg: '#E6FFFB', border: '#87E8DE', text: '#13C2C2' },
                          { bg: '#FFF7E6', border: '#FFD666', text: '#FA8C16' },
                          { bg: '#F6FFED', border: '#B7EB8F', text: '#52C41A' },
                          { bg: '#E6F7FF', border: '#91D5FF', text: '#1890FF' },
                        ];
                        const color = tagColors[index % tagColors.length];
                        return (
                          <Tag
                            key={tag.id}
                            style={{
                              backgroundColor: color.bg,
                              borderColor: color.border,
                              color: color.text,
                              borderRadius: 999,
                              paddingInline: 12,
                              fontWeight: 500,
                            }}
                          >
                            {tag.name}
                          </Tag>
                        );
                      })}
                    </Space>
                    <Card
                      style={{ ...cardStyle, boxShadow: 'none', borderRadius: token.borderRadiusLG }}
                      styles={{ body: { padding: 22 } }}
                    >
                      <div
                        className="md-body"
                        dangerouslySetInnerHTML={{
                          __html: articleData?.contentHtml || article.content || '' }}
                      />
                    </Card>
                    <Card
                      size="small"
                      style={{
                        ...cardStyle,
                        borderRadius: token.borderRadiusLG,
                        background: token.colorFillTertiary,
                      }}
                      styles={{ body: { padding: 18 } }}
                    >
                      <Space
                        style={{
                          width: '100%',
                          justifyContent: 'space-between',
                          alignItems: 'stretch',
                        }}
                        wrap
                      >
                        {articleData?.prevArticle ? (
                          <Link to={`/article/${articleData.prevArticle.id}`}>
                            <Button icon={<LeftOutlined />} style={{ minHeight: 44 }}>
                              上一篇: {articleData.prevArticle.title}
                            </Button>
                          </Link>
                        ) : (
                          <Typography.Text type="secondary">
                            已经是第一篇
                          </Typography.Text>
                        )}
                        {articleData?.nextArticle ? (
                          <Link to={`/article/${articleData.nextArticle.id}`}>
                            <Button icon={<RightOutlined />} style={{ minHeight: 44 }}>
                              下一篇: {articleData.nextArticle.title}
                            </Button>
                          </Link>
                        ) : (
                          <Typography.Text type="secondary">
                            已经是最后一篇
                          </Typography.Text>
                        )}
                      </Space>
                    </Card>
                    {relatedArticles && relatedArticles.length > 0 && (
                      <Card
                        size="small"
                        style={{ ...cardStyle, borderRadius: token.borderRadiusLG }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <Typography.Text strong style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <ThunderboltOutlined style={{ color: '#FA8C16' }} />
                          相关文章
                        </Typography.Text>
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                          {relatedArticles.map((item) => (
                            <Link
                              key={item.id}
                              to={`/article/${item.id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 12px',
                                borderRadius: token.borderRadiusSM,
                                backgroundColor: token.colorBgContainer,
                                border: `1px solid ${token.colorBorderSecondary}`,
                                transition: 'all 0.2s',
                                textDecoration: 'none',
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = token.colorPrimary;
                                (e.currentTarget as HTMLElement).style.boxShadow = token.boxShadow;
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = token.colorBorderSecondary;
                                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                              }}
                            >
                              {item.titleImage ? (
                                <Image
                                  src={item.titleImage}
                                  alt={item.title}
                                  style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8 }}
                                  lazy
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 80,
                                    height: 56,
                                    borderRadius: 8,
                                    background: token.colorFillSecondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 24,
                                  }}
                                >
                                  📝
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Typography.Text
                                  style={{
                                    color: token.colorText,
                                    fontWeight: 500,
                                    fontSize: 14,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {item.title}
                                </Typography.Text>
                                <Space size={8} style={{ marginTop: 4 }}>
                                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                    {dayjs(item.createTime).format('YYYY-MM-DD')}
                                  </Typography.Text>
                                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                    阅读 {item.readNum ?? 0}
                                  </Typography.Text>
                                </Space>
                              </div>
                            </Link>
                          ))}
                        </Space>
                      </Card>
                    )}
                    <Card
                      size="small"
                      style={{
                        ...cardStyle,
                        borderRadius: token.borderRadiusLG,
                        background: token.colorFillTertiary,
                      }}
                      styles={{ body: { padding: 20 } }}
                    >
                      <Space
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        wrap
                      >
                        <Button
                          type="primary"
                          icon={hasLiked ? <HeartFilled /> : <HeartOutlined />}
                          onClick={handleLike}
                          disabled={hasLiked}
                          style={{
                            minWidth: 140,
                            height: 48,
                            borderRadius: token.borderRadiusLG,
                            fontSize: 16,
                            fontWeight: 500,
                            color: hasLiked ? '#ff4d4f' : token.colorText,
                            backgroundColor: hasLiked ? '#fff1f0' : token.colorPrimary,
                            borderColor: hasLiked ? '#ffccc7' : token.colorPrimary,
                          }}
                        >
                          {hasLiked ? '已点赞' : '点赞'}
                          <span style={{ marginLeft: 8, fontWeight: 600 }}>{likeCount}</span>
                        </Button>
                        <Button
                          icon={<ShareAltOutlined />}
                          onClick={handleShare}
                          style={{
                            minWidth: 140,
                            height: 48,
                            borderRadius: token.borderRadiusLG,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          分享文章
                        </Button>
                        <Button
                          onClick={() => {
                            fetchRandomArticle(article?.id).then(res => {
                              const randomArticle = res.data as ArticleItem;
                              window.location.href = `/article/${randomArticle.id}`;
                            }).catch(() => {
                              antdMessage.error('获取随机文章失败');
                            });
                          }}
                          style={{
                            minWidth: 140,
                            height: 48,
                            borderRadius: token.borderRadiusLG,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          🎲 随机文章
                        </Button>
                      </Space>
                    </Card>
                  </Space>
                )}
              </Spin>
            </Card>
          </div>
          <div className="toc-sidebar">
            <TableOfContents toc={toc} />
          </div>
        </div>
      </WebShell>
      {showBackTop && (
        <Button
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            boxShadow: token.boxShadow,
          }}
        />
      )}
      <ImageLightbox
        visible={lightboxVisible}
        src={lightboxImage}
        alt={article?.title || ''}
        onClose={() => setLightboxVisible(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onPrev={() => {
          const newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : lightboxImages.length - 1;
          setLightboxIndex(newIndex);
          setLightboxImage(lightboxImages[newIndex]);
        }}
        onNext={() => {
          const newIndex = lightboxIndex < lightboxImages.length - 1 ? lightboxIndex + 1 : 0;
          setLightboxIndex(newIndex);
          setLightboxImage(lightboxImages[newIndex]);
        }}
      />
    </>
  );
};

export default ArticleDetailPage;

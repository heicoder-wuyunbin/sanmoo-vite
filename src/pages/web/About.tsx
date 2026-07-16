import React, { useMemo } from 'react';
import { Card, Space, Typography, Avatar, Row, Col, Tag, Statistic, theme as antTheme } from 'antd';
import { CodeOutlined, BarChartOutlined, LinkOutlined } from '@ant-design/icons';
import WebShell from './components/WebShell';
import { useLayoutStore } from '@/store/useLayoutStore';

const SKILLS = ['Go', 'Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'React', 'TypeScript', 'Nginx', 'Linux', 'Git'];

const AboutPage: React.FC = () => {
  const { settings, categories, tags, articleCount } = useLayoutStore();
  const { token } = antTheme.useToken();

  const author = settings?.coreConfig?.author || '作者';
  const introduction = settings?.coreConfig?.introduction || '暂无介绍';
  const links = [
    { label: 'GitHub', value: settings?.uiConfig?.githubHome, show: settings?.uiConfig?.githubShow, desc: '查看开源项目与代码沉淀' },
    { label: 'CSDN', value: settings?.uiConfig?.csdnHome, show: settings?.uiConfig?.csdnShow, desc: '关注文章同步与技术输出' },
    { label: 'Gitee', value: settings?.uiConfig?.giteeHome, show: settings?.uiConfig?.giteeShow, desc: '补充镜像仓库与协作内容' },
    { label: '知乎', value: settings?.uiConfig?.zhihuHome, show: settings?.uiConfig?.zhihuShow, desc: '了解更多长期观点与思考' },
  ].filter((item) => item.show && item.value);
  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadow,
      background: token.colorBgContainer,
    }),
    [token],
  );

  return (
    <WebShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card
          style={{
            ...cardStyle,
            background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgElevated} 58%, ${token.colorWarningBg} 100%)`,
          }}
          styles={{ body: { padding: 28 } }}
        >
          <Space direction="vertical" size={16} align="center" style={{ width: '100%' }}>
            <Avatar
              size={128}
              src={settings?.coreConfig?.avatar}
              style={{ marginBottom: 16 }}
            />
            <Tag color="blue" style={{ borderRadius: 999, paddingInline: 12 }}>
              个人原创内容创作者
            </Tag>
            <Typography.Title
              level={2}
              style={{ margin: 0, textAlign: 'center', color: token.colorText }}
            >
              关于 {author}
            </Typography.Title>
            <Typography.Paragraph
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                textAlign: 'center',
                color: token.colorTextSecondary,
                maxWidth: 720,
              }}
            >
              {introduction}
            </Typography.Paragraph>
          </Space>
        </Card>

        {/* 技术栈 */}
        <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
          <Typography.Title level={4} style={{ margin: '0 0 16px' }}>
            <CodeOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
            技术栈
          </Typography.Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SKILLS.map((skill) => (
              <Tag
                key={skill}
                style={{
                  borderRadius: 999,
                  padding: '4px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  background: `${token.colorPrimary}10`,
                  borderColor: `${token.colorPrimary}30`,
                  color: token.colorPrimary,
                }}
              >
                {skill}
              </Tag>
            ))}
          </div>
        </Card>

        {/* 社交链接 */}
        <Row gutter={[16, 16]}>
          {links.map((item) => (
            <Col xs={24} md={12} key={item.label}>
              <Card style={cardStyle} hoverable styles={{ body: { padding: 22 } }}>
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <Typography.Title level={4} style={{ margin: 0, color: token.colorText }}>
                    <LinkOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                    {item.label}
                  </Typography.Title>
                  <Typography.Text style={{ color: token.colorTextSecondary }}>
                    {item.desc}
                  </Typography.Text>
                  <a href={item.value} target="_blank" rel="noopener noreferrer" style={{ color: token.colorPrimary }}>
                    {item.value}
                  </a>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 博客数据 */}
        <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
          <Typography.Title level={4} style={{ margin: '0 0 16px' }}>
            <BarChartOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
            博客数据
          </Typography.Title>
          <Row gutter={[16, 16]}>
            <Col xs={8}>
              <Statistic title="文章总数" value={articleCount || 0} />
            </Col>
            <Col xs={8}>
              <Statistic title="分类数" value={categories?.length || 0} />
            </Col>
            <Col xs={8}>
              <Statistic title="标签数" value={tags?.length || 0} />
            </Col>
          </Row>
        </Card>
      </Space>
    </WebShell>
  );
};

export default AboutPage;

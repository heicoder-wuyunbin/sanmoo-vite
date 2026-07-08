import React, { useMemo } from 'react';
import { Card, Space, Typography, Avatar, Row, Col, Tag, theme as antTheme } from 'antd';
import WebShell from './components/WebShell';
import { useLayoutStore } from '@/store/useLayoutStore';

const AboutPage: React.FC = () => {
  const { settings } = useLayoutStore();
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

        <Row gutter={[16, 16]}>
          {links.map((item) => (
            <Col xs={24} md={12} key={item.label}>
              <Card style={cardStyle} styles={{ body: { padding: 22 } }}>
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <Typography.Title level={4} style={{ margin: 0, color: token.colorText }}>
                    {item.label}
                  </Typography.Title>
                  <Typography.Text style={{ color: token.colorTextSecondary }}>
                    {item.desc}
                  </Typography.Text>
                  {item.value ? (
                    <a href={item.value} target="_blank" rel="noopener noreferrer" style={{ color: token.colorPrimary }}>
                      {item.value}
                    </a>
                  ) : (
                    <Typography.Text type="secondary">未设置</Typography.Text>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    </WebShell>
  );
};

export default AboutPage;

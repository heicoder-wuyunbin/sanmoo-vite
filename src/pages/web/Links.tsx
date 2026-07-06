import React, { useMemo } from 'react';
import { Card, Space, Typography, Row, Col, theme as antTheme, Spin, Empty } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import WebShell from './components/WebShell';
import { fetchActiveLinks, type LinkItem } from '@/services/blog/api';
import { useQuery } from '@tanstack/react-query';

const LinksPage: React.FC = () => {
  const { token } = antTheme.useToken();

  const { data: links, isLoading } = useQuery<LinkItem[]>({
    queryKey: ['activeLinks'],
    queryFn: async () => {
      const res = await fetchActiveLinks();
      return res.data || [];
    },
  });

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadow,
      background: token.colorBgContainer,
      transition: 'all 0.3s ease',
    }),
    [token],
  );

  return (
    <WebShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card
          style={{
            ...cardStyle,
            background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgElevated} 58%, ${token.colorSuccessBg} 100%)`,
          }}
          styles={{ body: { padding: 28 } }}
        >
          <Space direction="vertical" size={16} align="center" style={{ width: '100%' }}>
            <Typography.Title
              level={2}
              style={{ margin: 0, textAlign: 'center', color: token.colorText }}
            >
              友情链接
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
              感谢这些优秀的网站与社区，它们为开发者提供了宝贵的学习资源和交流平台
            </Typography.Paragraph>
          </Space>
        </Card>

        <Spin spinning={isLoading}>
          {links && links.length > 0 ? (
            <Row gutter={[16, 16]}>
              {links.map((item) => (
                <Col xs={24} md={12} lg={8} key={item.id}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Card
                      style={{
                        ...cardStyle,
                        cursor: 'pointer',
                      }}
                      hoverable
                      styles={{ body: { padding: 22 } }}
                    >
                      <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Space>
                          {item.icon ? (
                            <img
                              src={item.icon}
                              alt={item.name}
                              style={{ width: 24, height: 24, borderRadius: 6 }}
                            />
                          ) : (
                            <LinkOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
                          )}
                          <Typography.Title level={4} style={{ margin: 0, color: token.colorText }}>
                            {item.name}
                          </Typography.Title>
                        </Space>
                        {item.description && (
                          <Typography.Text style={{ color: token.colorTextSecondary }}>
                            {item.description}
                          </Typography.Text>
                        )}
                        <Typography.Text style={{ color: token.colorPrimary, fontSize: 14 }}>
                          {item.url}
                        </Typography.Text>
                      </Space>
                    </Card>
                  </a>
                </Col>
              ))}
            </Row>
          ) : (
            <Card style={cardStyle}>
              <Empty description="暂无友情链接" />
            </Card>
          )}
        </Spin>

        <Card style={cardStyle} styles={{ body: { padding: 22 } }}>
          <Typography.Title level={4} style={{ margin: 0, color: token.colorText, marginBottom: 12 }}>
            申请友链
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary }}>
            欢迎申请友情链接！请确保您的网站：
          </Typography.Paragraph>
          <ul style={{ color: token.colorTextSecondary, paddingLeft: 20, margin: 0 }}>
            <li>内容健康，无违法违规信息</li>
            <li>以技术分享、编程学习为主</li>
            <li>已添加本站链接</li>
          </ul>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, marginTop: 12 }}>
            如有合作意向，请通过邮箱联系：contact@example.com
          </Typography.Paragraph>
        </Card>
      </Space>
    </WebShell>
  );
};

export default LinksPage;
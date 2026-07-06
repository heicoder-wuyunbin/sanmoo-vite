import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  BulbFilled,
  BulbOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  ReadOutlined,
  SearchOutlined,
  TagsOutlined,
  BookOutlined,
  HeartOutlined,
  HistoryOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Dropdown,
  Grid,
  Input,
  Layout,
  Menu,
  Space,
  theme as antTheme,
} from 'antd';
import { getAccessToken } from '@/utils/auth';
import { useTheme } from '@/hooks/useTheme';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const navItems = [
  { key: '/', label: '首页', icon: <HomeOutlined /> },
  { key: '/archives', label: '归档', icon: <ReadOutlined /> },
  { key: '/categories', label: '分类', icon: <AppstoreOutlined /> },
  { key: '/tags', label: '标签', icon: <TagsOutlined /> },
  { key: '/topics', label: '专题', icon: <BookOutlined /> },
  { key: '/favorites', label: '收藏', icon: <HeartOutlined /> },
  { key: '/history', label: '历史', icon: <HistoryOutlined /> },
  { key: '/links', label: '友链', icon: <ShareAltOutlined /> },
  { key: '/about', label: '关于', icon: <InfoCircleOutlined /> },
];

const CONTAINER_MAX_WIDTH = 1200;

type WebHeaderProps = {
  blogName: string;
  onSearchClick: () => void;
};

const WebHeader: React.FC<WebHeaderProps> = ({ blogName, onSearchClick }) => {
  const screens = useBreakpoint();
  const isDesktop = !!screens.lg;
  const location = useLocation();
  const { token } = antTheme.useToken();
  const { isDark, toggleTheme } = useTheme();
  const isLoggedIn = !!getAccessToken();
  const [searchText, setSearchText] = useState('');

  const mobileMenuItems = navItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: <Link to={item.key}>{item.label}</Link>,
  }));

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: token.colorBgElevated,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowSecondary,
        paddingInline: 16,
        height: 64,
        lineHeight: '64px',
      }}
    >
      <div
        style={{
          maxWidth: CONTAINER_MAX_WIDTH,
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Avatar
            size={36}
            style={{
              background: token.colorPrimary,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {Array.from(blogName)[0]}
          </Avatar>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, color: token.colorText, fontSize: 15 }}>
              {blogName}
            </div>
            {isDesktop ? (
              <div style={{ color: token.colorTextTertiary, fontSize: 11, marginTop: 2 }}>
                Backend Art · 技术沉淀
              </div>
            ) : null}
          </div>
        </Link>

        {isDesktop ? (
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <Link to={item.key}>{item.label}</Link>,
            }))}
            style={{ background: 'transparent', borderBottom: 'none', flex: 1, minWidth: 400 }}
          />
        ) : null}

        <Space size={12} align="center">
          {isDesktop ? (
            <Input
              placeholder="搜索文章…"
              prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} aria-hidden="true" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onClick={onSearchClick}
              allowClear
              style={{ width: 220, cursor: 'pointer' }}
            />
          ) : (
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={onSearchClick}
              aria-label="搜索文章"
            />
          )}

          <Button
            type="text"
            icon={isDark ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
            title={isDark ? '切换到浅色模式' : '切换到深色模式'}
            aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
          />

          {isLoggedIn ? (
            <Link to="/admin">
              <Button type="primary">管理后台</Button>
            </Link>
          ) : (
            <Link to="/user/login">
              <Button type="default" icon={<LoginOutlined />}>
                登录
              </Button>
            </Link>
          )}

          {!isDesktop ? (
            <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight">
              <Button type="text" icon={<AppstoreOutlined />} aria-label="导航菜单" />
            </Dropdown>
          ) : null}
        </Space>
      </div>
    </Header>
  );
};

export default WebHeader;

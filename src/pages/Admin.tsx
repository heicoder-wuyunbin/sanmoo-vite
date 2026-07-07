import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Avatar,
  theme as antTheme,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  TagsOutlined,
  FolderOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileImageOutlined,
  BulbOutlined,
  BulbFilled,
  DownOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MonitorOutlined,
  BookOutlined,
  BugOutlined,
  WechatOutlined,
  SafetyOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  PictureOutlined,
  LinkOutlined,
  LockOutlined,
  KeyOutlined,
  EyeOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { clearAuth, getCurrentUser, getCurrentUserId } from '@/utils/auth';
import { updateUserPassword } from '@/services/blog/api';
import { useTheme } from '@/hooks/useTheme';
import { usePermStore } from '@/store/usePermStore';

const { Header, Sider, Content } = Layout;

// 图标名称到组件的映射（用于后端动态菜单渲染）
const ICON_MAP: Record<string, React.FC<any>> = {
  HomeOutlined,
  FileTextOutlined,
  TagsOutlined,
  FolderOutlined,
  UserOutlined,
  SettingOutlined,
  FileImageOutlined,
  GlobalOutlined,
  MonitorOutlined,
  BookOutlined,
  BugOutlined,
  WechatOutlined,
  SafetyOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  PictureOutlined,
  LinkOutlined,
  LockOutlined,
  KeyOutlined,
  EyeOutlined,
  FileSearchOutlined,
};

const MODULE_ICON_MAP: Record<string, React.FC<any>> = {
  dashboard: BarChartOutlined,
  article: FileTextOutlined,
  category: FolderOutlined,
  tag: TagsOutlined,
  topic: BookOutlined,
  link: LinkOutlined,
  file: PictureOutlined,
  user: UserOutlined,
  mpuser: WechatOutlined,
  role: TeamOutlined,
  permission: LockOutlined,
  maintenance: MonitorOutlined,
  setting: SettingOutlined,
};

// 模块中文名映射
const MODULE_LABELS: Record<string, string> = {
  dashboard: '系统',
  article: '内容管理',
  category: '内容管理',
  tag: '内容管理',
  topic: '内容管理',
  link: '内容管理',
  file: '媒体资源',
  user: '用户权限',
  mpuser: '用户权限',
  role: '用户权限',
  permission: '用户权限',
  maintenance: '监控运维',
  setting: '系统配置',
};

/**
 * Ant Design Pro 风格的管理后台布局。
 * - 侧边栏: 深蓝黑 (#001529) + 主色高亮
 * - 顶部栏: 白色/深色, 带系统名 + 主题切换 + 用户菜单
 * - 内容区: 统一 padding + 卡片包裹
 */
const Admin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('管理员');
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [form] = Form.useForm();
  const { token } = antTheme.useToken();
  const { isDark, toggleTheme } = useTheme();
  const { isLoaded, loadPermissions, hasPerm, menus } = usePermStore();

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.username) setCurrentUser(user.username);
    setCurrentUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      loadPermissions();
    }
  }, [isLoaded, loadPermissions]);

  const handleLogout = () => {
    clearAuth();
    navigate('/user/login', { replace: true });
  };

  const handlePasswordChange = async () => {
    if (!currentUserId) return;
    try {
      const values = await form.validateFields();
      setIsUpdatingPassword(true);
      await updateUserPassword(currentUserId, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      setIsPasswordModalVisible(false);
      form.resetFields();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'errorFields' in error
      ) {
        return;
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'changePassword',
      icon: <SettingOutlined />,
      label: '修改密码',
      onClick: () => {
        form.resetFields();
        setIsPasswordModalVisible(true);
      },
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 静态菜单配置（fallback，当后端未返回菜单时使用）
  const staticMenuGroups = [
    {
      key: 'group-system',
      label: '系统',
      icon: <BarChartOutlined />,
      items: [
        { key: '/admin', icon: <HomeOutlined />, label: '仪表盘', perm: 'dashboard:read' },
      ],
    },
    {
      key: 'group-content',
      label: '内容管理',
      icon: <FileTextOutlined />,
      items: [
        { key: '/admin/articles', icon: <FileTextOutlined />, label: '文章管理', perm: 'article:list' },
        { key: '/admin/categories', icon: <FolderOutlined />, label: '分类管理', perm: 'category:list' },
        { key: '/admin/tags', icon: <TagsOutlined />, label: '标签管理', perm: 'tag:list' },
        { key: '/admin/topics', icon: <BookOutlined />, label: '专题管理', perm: 'topic:list' },
        { key: '/admin/links', icon: <LinkOutlined />, label: '友情链接', perm: 'link:list' },
      ],
    },
    {
      key: 'group-media',
      label: '媒体资源',
      icon: <PictureOutlined />,
      items: [
        { key: '/admin/files', icon: <FileImageOutlined />, label: '文件管理', perm: 'file:list' },
      ],
    },
    {
      key: 'group-user-perm',
      label: '用户权限',
      icon: <UserOutlined />,
      items: [
        { key: '/admin/users', icon: <UserOutlined />, label: '用户管理', perm: 'user:list' },
        { key: '/admin/mp-users', icon: <WechatOutlined />, label: '微信用户', perm: 'mpuser:list' },
        { key: '/admin/roles', icon: <TeamOutlined />, label: '角色管理', perm: 'role:list' },
        { key: '/admin/permissions', icon: <LockOutlined />, label: '权限列表', perm: 'permission:list' },
      ],
    },
    {
      key: 'group-monitor',
      label: '监控运维',
      icon: <MonitorOutlined />,
      items: [
        { key: '/admin/visitors', icon: <LineChartOutlined />, label: '访问记录', perm: 'dashboard:visitors' },
        { key: '/admin/errors', icon: <BugOutlined />, label: '错误日志', perm: 'dashboard:errors' },
      ],
    },
    {
      key: 'group-setting',
      label: '系统配置',
      icon: <SettingOutlined />,
      items: [
        { key: '/admin/settings', icon: <SettingOutlined />, label: '设置', perm: 'setting:read' },
      ],
    },
  ];

  // 模块名到组 key 的映射（用于动态菜单）
  const MODULE_GROUP_KEYS: Record<string, string> = {
    dashboard: 'group-system',
    article: 'group-content',
    category: 'group-content',
    tag: 'group-content',
    topic: 'group-content',
    link: 'group-content',
    file: 'group-media',
    user: 'group-user-perm',
    mpuser: 'group-user-perm',
    role: 'group-user-perm',
    permission: 'group-user-perm',
    maintenance: 'group-monitor',
    setting: 'group-setting',
  };

  // 动态菜单渲染（优先使用后端返回的菜单）
  const { menuItems, firstGroupKey } = useMemo(() => {
    const result: MenuProps['items'] = [];
    let firstKey = '';

    if (menus && menus.length > 0) {
      const groupMap = new Map<string, { label: string; icon: React.ReactNode; children: any[] }>();
      menus.forEach((m) => {
        const groupKey = MODULE_GROUP_KEYS[m.module] || `group-${m.module}`;
        const label = MODULE_LABELS[m.module] || m.module;
        const groupIconComponent = MODULE_ICON_MAP[m.module];
        const groupIcon = groupIconComponent ? React.createElement(groupIconComponent) : <FileTextOutlined />;
        if (!groupMap.has(groupKey)) {
          groupMap.set(groupKey, { label, icon: groupIcon, children: [] });
        }
        const IconComp = ICON_MAP[m.icon] || MODULE_ICON_MAP[m.module] || FileTextOutlined;
        groupMap.get(groupKey)!.children.push({
          key: m.frontPath,
          icon: <IconComp />,
          label: m.name,
        });
      });

      groupMap.forEach((group, key) => {
        if (!firstKey) firstKey = key;
        result.push({
          key,
          label: group.label,
          icon: group.icon,
          children: group.children,
        });
      });
    } else {
      staticMenuGroups.forEach((group) => {
        const visibleItems = group.items
          .filter((item) => !item.perm || hasPerm(item.perm))
          .map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }));
        if (visibleItems.length === 0) return;
        if (!firstKey) firstKey = group.key;
        result.push({
          key: group.key,
          label: group.label,
          icon: group.icon,
          children: visibleItems,
        });
      });
    }

    return { menuItems: result, firstGroupKey: firstKey };
  }, [menus, hasPerm]);

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (firstGroupKey) {
      setOpenKeys([firstGroupKey]);
    }
  }, [firstGroupKey]);

  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys(keys);
    }
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  // 根据当前路由选中正确的菜单项
  const selectedKey = (() => {
    const path = location.pathname;
    // 仪表盘精确匹配，其余菜单项前缀匹配
    if (path === '/admin') return ['/admin'];
    const allItems = staticMenuGroups.flatMap((g) => g.items);
    const match = allItems.find((item) => item.key !== '/admin' && path.startsWith(item.key));
    return match ? [match.key] : ['/admin'];
  })();

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      {/* ---------- 侧边栏（AntD Pro 经典深色） ---------- */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        theme="dark"
        trigger={null}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Logo 区 */}
        <div className="pro-sider-logo" style={{ background: '#002140' }}>
          {collapsed ? (
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>S</span>
          ) : (
            <>
              <span style={{ color: '#fff' }}>Sanmoo Blog</span>
              <span className="pro-sider-logo-sub">Admin Console</span>
            </>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ borderInlineEnd: 'none', padding: '12px 8px' }}
        />
      </Sider>

      {/* ---------- 右侧布局 ---------- */}
      <Layout style={{ background: token.colorBgLayout }}>
        {/* 顶部栏 */}
        <Header
          className="pro-header"
          style={{
            height: 56,
            padding: '0 24px',
            lineHeight: '56px',
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Space align="center" size={12}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />
            <Typography.Text strong style={{ fontSize: 16, color: token.colorText }}>
              管理后台
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
              Sanmoo Blog · Admin
            </Typography.Text>
          </Space>

          <Space size={8} align="center">
            {/* 主题切换按钮 */}
            <Button
              type="text"
              icon={isDark ? <BulbFilled /> : <BulbOutlined />}
              onClick={toggleTheme}
              title={isDark ? '切换到浅色模式' : '切换到深色模式'}
              aria-label="toggle-theme"
            />

            {/* 返回前台 */}
            <Link to="/" style={{ color: token.colorPrimary }}>
              <Button type="text" icon={<GlobalOutlined />} style={{ color: token.colorPrimary }}>
                前台首页
              </Button>
            </Link>

            {/* 用户菜单 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space
                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                size={8}
              >
                <Avatar size="small" icon={<UserOutlined />} />
                <Typography.Text style={{ color: token.colorText }}>
                  {currentUser}
                </Typography.Text>
                <DownOutlined style={{ fontSize: 10, color: token.colorTextTertiary }} />
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区 */}
        <Content style={{ margin: '16px', padding: 0 }}>
          <div
            style={{
              minHeight: 'calc(100vh - 88px)',
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              padding: 20,
              boxShadow: token.boxShadowTertiary,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* 修改密码模态窗 */}
      <Modal
        title="修改密码"
        open={isPasswordModalVisible}
        onOk={handlePasswordChange}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          form.resetFields();
        }}
        okText="确认修改"
        cancelText="取消"
        confirmLoading={isUpdatingPassword}
        okButtonProps={{ type: 'primary' }}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="oldPassword"
            label="旧密码"
            rules={[{ required: true, message: '请输入旧密码' }]}
          >
            <Input.Password placeholder="请输入旧密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Admin;
